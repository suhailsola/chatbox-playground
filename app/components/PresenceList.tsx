interface Props {
  users: string[];
  currentNickname: string;
  connected: boolean;
}

export function PresenceList({ users, currentNickname, connected }: Props) {
  return (
    <aside className="w-44 shrink-0 bg-gray-900 border-l border-gray-800 p-4 hidden lg:flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            connected ? "bg-green-500" : "bg-gray-500"
          }`}
        />
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Online — {users.length}
        </p>
      </div>
      <ul className="flex flex-col gap-1.5">
        {users.map((name) => (
          <li key={name} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <span
              className={
                name === currentNickname
                  ? "text-indigo-300 font-medium truncate"
                  : "text-gray-300 truncate"
              }
            >
              {name === currentNickname ? `${name} (you)` : name}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
