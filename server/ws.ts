import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import type { Server } from "http";
import type {
  ClientWsMessage,
  ServerWsMessage,
  RoomMessage,
} from "../app/types.js";

const MAX_HISTORY = 50;

interface ConnectedUser {
  socket: WebSocket;
  nickname: string;
  roomId: string;
}

// In-memory room state (lives for the duration of the Node process)
const roomMessages = new Map<string, RoomMessage[]>();
const roomUsers = new Map<string, Set<ConnectedUser>>();

function getRoomMessages(roomId: string): RoomMessage[] {
  if (!roomMessages.has(roomId)) roomMessages.set(roomId, []);
  return roomMessages.get(roomId)!;
}

function getRoomUsers(roomId: string): Set<ConnectedUser> {
  if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Set());
  return roomUsers.get(roomId)!;
}

function broadcast(roomId: string, msg: ServerWsMessage) {
  const raw = JSON.stringify(msg);
  for (const user of getRoomUsers(roomId)) {
    if (user.socket.readyState === WebSocket.OPEN) {
      user.socket.send(raw);
    }
  }
}

function broadcastPresence(roomId: string) {
  const users = Array.from(getRoomUsers(roomId)).map((u) => u.nickname);
  broadcast(roomId, { type: "presence", users });
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function pushMessage(roomId: string, msg: RoomMessage) {
  const history = getRoomMessages(roomId);
  history.push(msg);
  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }
}

export function attachWebSocketServer(httpServer: Server) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (req, socket, head) => {
    if (req.url !== "/ws") return;
    wss.handleUpgrade(req, socket as import("net").Socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (socket: WebSocket, _req: IncomingMessage) => {
    let user: ConnectedUser | null = null;

    socket.on("message", (data) => {
      let msg: ClientWsMessage;
      try {
        msg = JSON.parse(data.toString()) as ClientWsMessage;
      } catch {
        return;
      }

      if (msg.type === "join") {
        user = { socket, nickname: msg.nickname, roomId: msg.roomId };
        getRoomUsers(msg.roomId).add(user);

        // Send message history to the newly joined user
        const historyMsg: ServerWsMessage = {
          type: "history",
          messages: getRoomMessages(msg.roomId),
        };
        socket.send(JSON.stringify(historyMsg));

        // Announce join to everyone in the room
        const joinMsg: RoomMessage = {
          id: generateId(),
          kind: "system",
          content: `${msg.nickname} joined the room`,
          timestamp: Date.now(),
        };
        pushMessage(msg.roomId, joinMsg);
        broadcast(msg.roomId, { type: "message", message: joinMsg });
        broadcastPresence(msg.roomId);
        return;
      }

      if (msg.type === "chat" && user) {
        const chatMsg: RoomMessage = {
          id: generateId(),
          kind: "chat",
          nickname: user.nickname,
          content: msg.content,
          timestamp: Date.now(),
        };
        pushMessage(user.roomId, chatMsg);
        broadcast(user.roomId, { type: "message", message: chatMsg });
      }
    });

    socket.on("close", () => {
      if (!user) return;
      getRoomUsers(user.roomId).delete(user);

      const leaveMsg: RoomMessage = {
        id: generateId(),
        kind: "system",
        content: `${user.nickname} left the room`,
        timestamp: Date.now(),
      };
      pushMessage(user.roomId, leaveMsg);
      broadcast(user.roomId, { type: "message", message: leaveMsg });
      broadcastPresence(user.roomId);
    });
  });

  return wss;
}
