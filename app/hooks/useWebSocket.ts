import { useEffect, useRef, useState, useCallback } from "react";
import type { ServerWsMessage, RoomMessage } from "../types";

interface UseWebSocketOptions {
  roomId: string;
  nickname: string | null;
  enabled: boolean;
}

interface UseWebSocketReturn {
  messages: RoomMessage[];
  onlineUsers: string[];
  sendMessage: (content: string) => void;
  connected: boolean;
}

export function useWebSocket({
  roomId,
  nickname,
  enabled,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled || !nickname) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "join", roomId, nickname }));
    };

    ws.onmessage = (event) => {
      const msg: ServerWsMessage = JSON.parse(event.data as string);

      if (msg.type === "history") {
        setMessages(msg.messages);
      } else if (msg.type === "presence") {
        setOnlineUsers(msg.users);
      } else if (msg.type === "message") {
        setMessages((prev) => [...prev, msg.message]);
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, nickname, enabled]);

  const sendMessage = useCallback(
    (content: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "chat", roomId, content }));
      }
    },
    [roomId]
  );

  return { messages, onlineUsers, sendMessage, connected };
}
