import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useParams } from "react-router";
import { DEFAULT_ROOMS } from "../rooms";
import type { AiMessage, RoomMessage } from "../types";
import { useWebSocket } from "../hooks/useWebSocket";
import { NicknameModal } from "../components/NicknameModal";
import { PresenceList } from "../components/PresenceList";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Human room components ───────────────────────────────────────────────────

function HumanMessageBubble({ msg, currentNickname }: { msg: RoomMessage; currentNickname: string }) {
  if (msg.kind === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-500 italic">{msg.content}</span>
      </div>
    );
  }

  const isMe = msg.nickname === currentNickname;

  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} mb-3`}>
      {!isMe && (
        <span className="text-xs text-gray-500 ml-1 mb-0.5">{msg.nickname}</span>
      )}
      <div
        className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isMe
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-gray-800 text-gray-100 rounded-bl-sm"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ─── AI room components ───────────────────────────────────────────────────────

function AiMessageBubble({ message }: { message: AiMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shrink-0">
          AI
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-gray-800 text-gray-100 rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold ml-2 mt-1 shrink-0">
          You
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0">
        AI
      </div>
      <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ─── Meta ────────────────────────────────────────────────────────────────────

export function meta({ params }: { params: { roomId?: string } }) {
  const room = DEFAULT_ROOMS.find((r) => r.id === params.roomId);
  return [{ title: room ? `${room.name} — Chatbox Playground` : "Chat Room" }];
}

// ─── Human room ──────────────────────────────────────────────────────────────

function HumanRoom({ roomId, roomName, roomIcon }: { roomId: string; roomName: string; roomIcon: string }) {
  const [nickname, setNickname] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, onlineUsers, sendMessage, connected } = useWebSocket({
    roomId,
    nickname,
    enabled: nickname !== null,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || !connected) return;
    sendMessage(trimmed);
    setInput("");
  }, [input, connected, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      {/* Nickname modal shown until user picks one */}
      {nickname === null && (
        <NicknameModal
          roomName={roomName}
          roomIcon={roomIcon}
          onConfirm={setNickname}
        />
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Rooms
          </Link>
          <span className="text-gray-700">|</span>
          <span className="text-xl">{roomIcon}</span>
          <div>
            <h1 className="font-semibold text-white text-sm leading-tight">{roomName}</h1>
            <p className="text-gray-500 text-xs">{onlineUsers.length} online</p>
          </div>
        </div>
        {nickname && (
          <span className="text-xs text-gray-500">
            You are <span className="text-indigo-400 font-medium">{nickname}</span>
          </span>
        )}
      </header>

      {/* Body: messages + presence */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
              <span className="text-5xl">{roomIcon}</span>
              <p className="text-gray-400 text-sm max-w-xs">
                No messages yet. Say hi!
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <HumanMessageBubble
              key={msg.id}
              msg={msg}
              currentNickname={nickname ?? ""}
            />
          ))}

          <div ref={bottomRef} />
        </main>

        {nickname && (
          <PresenceList
            users={onlineUsers}
            currentNickname={nickname}
            connected={connected}
          />
        )}
      </div>

      {/* Input */}
      <footer className="shrink-0 border-t border-gray-800 bg-gray-900 px-4 py-3">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              !nickname
                ? "Enter a nickname to chat…"
                : connected
                ? `Message ${roomName}…`
                : "Connecting…"
            }
            rows={1}
            disabled={!nickname || !connected}
            className="flex-1 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !nickname || !connected}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors shrink-0"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

// ─── AI room ─────────────────────────────────────────────────────────────────

function AIRoom({ roomName, roomIcon, systemPrompt }: { roomName: string; roomIcon: string; systemPrompt: string }) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: AiMessage = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemPrompt,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data) as { text?: string; error?: string };
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) {
              accumulated += parsed.text;
              setStreamingContent(accumulated);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: accumulated, timestamp: Date.now() },
      ]);
      setStreamingContent("");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message ?? "Something went wrong");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, messages, systemPrompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleStop = () => abortRef.current?.abort();
  const clearChat = () => {
    if (isStreaming) handleStop();
    setMessages([]);
    setStreamingContent("");
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Rooms
          </Link>
          <span className="text-gray-700">|</span>
          <span className="text-xl">{roomIcon}</span>
          <div>
            <h1 className="font-semibold text-white text-sm leading-tight">{roomName}</h1>
            <p className="text-gray-500 text-xs">Powered by Claude</p>
          </div>
        </div>
        <button onClick={clearChat} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
          Clear chat
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
            <span className="text-5xl">{roomIcon}</span>
            <p className="text-gray-400 text-sm max-w-xs">
              Ask Claude anything. Press{" "}
              <kbd className="bg-gray-800 px-1 rounded text-xs">Enter</kbd> to send,{" "}
              <kbd className="bg-gray-800 px-1 rounded text-xs">Shift+Enter</kbd> for a new line.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <AiMessageBubble key={msg.id} message={msg} />
        ))}

        {isStreaming && streamingContent && (
          <AiMessageBubble
            message={{ id: "streaming", role: "assistant", content: streamingContent, timestamp: Date.now() }}
          />
        )}

        {isStreaming && !streamingContent && <TypingIndicator />}

        {error && (
          <div className="text-red-400 text-sm text-center py-2 bg-red-900/20 rounded-lg px-4 mt-2">
            Error: {error}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <footer className="shrink-0 border-t border-gray-800 bg-gray-900 px-4 py-3">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${roomName}…`}
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
          />
          {isStreaming ? (
            <button
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors shrink-0"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => void sendMessage()}
              disabled={!input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors shrink-0"
            >
              Send
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

// ─── Main route component ─────────────────────────────────────────────────────

export default function Room() {
  const { roomId } = useParams();
  const room = DEFAULT_ROOMS.find((r) => r.id === roomId);

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-400">Room not found.</p>
        <Link to="/" className="text-indigo-400 hover:underline">
          Back to rooms
        </Link>
      </div>
    );
  }

  if (room.type === "human") {
    return (
      <HumanRoom roomId={room.id} roomName={room.name} roomIcon={room.icon} />
    );
  }

  return (
    <AIRoom
      roomName={room.name}
      roomIcon={room.icon}
      systemPrompt={room.systemPrompt}
    />
  );
}
