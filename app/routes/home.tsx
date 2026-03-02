import { Link } from "react-router";
import { DEFAULT_ROOMS } from "../rooms";

export function meta() {
  return [
    { title: "Chatbox Playground" },
    { name: "description", content: "Multi-room chat — talk to people or ask Claude" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Chatbox Playground
          </h1>
          <p className="text-gray-400 text-lg">
            Join a room and chat with others — or ask Claude
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DEFAULT_ROOMS.map((room) => (
            <Link
              key={room.id}
              to={`/rooms/${room.id}`}
              className="group bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-indigo-500 hover:bg-gray-800 transition-all duration-150"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{room.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {room.name}
                    </h2>
                    {room.type === "ai" && (
                      <span className="text-xs bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-1.5 py-0.5 rounded-full font-medium">
                        AI
                      </span>
                    )}
                    {room.type === "human" && (
                      <span className="text-xs bg-green-900/40 text-green-400 border border-green-700/40 px-1.5 py-0.5 rounded-full font-medium">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-0.5">{room.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-gray-600 text-xs mt-10">
          Live rooms use WebSockets · AI room uses Claude
        </p>
      </div>
    </div>
  );
}
