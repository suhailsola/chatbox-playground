import { useState } from "react";

interface Props {
  roomName: string;
  roomIcon: string;
  onConfirm: (nickname: string) => void;
}

export function NicknameModal({ roomName, roomIcon, onConfirm }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length < 1 || trimmed.length > 20) return;
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-4xl mb-3">{roomIcon}</div>
        <h2 className="text-lg font-semibold text-white mb-1">
          Join {roomName}
        </h2>
        <p className="text-gray-400 text-sm mb-5">
          Pick a nickname to enter the room.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            autoFocus
            type="text"
            maxLength={20}
            placeholder="Your nickname…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-gray-800 text-gray-100 placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
          >
            Enter Room
          </button>
        </form>
      </div>
    </div>
  );
}
