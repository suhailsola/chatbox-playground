import type { Room } from "./types";

export const DEFAULT_ROOMS: Room[] = [
  {
    id: "general",
    type: "human",
    name: "General",
    description: "Open chat for everyone",
    icon: "💬",
  },
  {
    id: "brainstorm",
    type: "human",
    name: "Brainstorm",
    description: "Collaborate on ideas with others",
    icon: "🧠",
  },
  {
    id: "code-helper",
    type: "human",
    name: "Code Helper",
    description: "Debug and discuss code with peers",
    icon: "💻",
  },
  {
    id: "ai",
    type: "ai",
    name: "Ask Claude",
    description: "Solo AI chat powered by Claude",
    icon: "🤖",
    systemPrompt:
      "You are a helpful and friendly assistant. Keep responses concise and conversational.",
  },
];
