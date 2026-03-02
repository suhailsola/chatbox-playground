import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("rooms/:roomId", "routes/room.tsx"),
  route("api/chat", "routes/api.chat.ts"),
] satisfies RouteConfig;
