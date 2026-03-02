// ---- Shared ----

export type Role = "user" | "assistant"; // still used by AI room SSE

// ---- Room config types ----

interface BaseRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface HumanRoom extends BaseRoom {
  type: "human";
}

export interface AIRoom extends BaseRoom {
  type: "ai";
  systemPrompt: string;
}

export type Room = HumanRoom | AIRoom;

// ---- Message types used in human rooms ----

export interface ChatMessage {
  id: string;
  kind: "chat";
  nickname: string;
  content: string;
  timestamp: number;
}

export interface SystemMessage {
  id: string;
  kind: "system";
  content: string;
  timestamp: number;
}

export type RoomMessage = ChatMessage | SystemMessage;

// ---- WebSocket protocol (client <-> server) ----

// Client → Server
export type ClientWsMessage =
  | { type: "join"; roomId: string; nickname: string }
  | { type: "chat"; roomId: string; content: string };

// Server → Client
export type ServerWsMessage =
  | { type: "history"; messages: RoomMessage[] }
  | { type: "presence"; users: string[] }
  | { type: "message"; message: RoomMessage };

// ---- AI room message (still used by route/room.tsx SSE path) ----

export interface AiMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}
