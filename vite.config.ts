import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { Plugin } from "vite";

// Attaches the WebSocket server to Vite's dev HTTP server.
// Dynamic import keeps the `ws` package out of the client bundle.
function webSocketPlugin(): Plugin {
  return {
    name: "chatbox-ws",
    configureServer(server) {
      if (!server.httpServer) return;
      // Only attach once — prevent re-attachment on HMR restarts
      const httpServer = server.httpServer as typeof server.httpServer & { _wsAttached?: boolean };
      if (!httpServer._wsAttached) {
        httpServer._wsAttached = true;
        import("./server/ws.js").then(({ attachWebSocketServer }) => {
          attachWebSocketServer(server.httpServer!);
        });
      }
      // Silence Chrome DevTools polling noise
      server.middlewares.use("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
        res.writeHead(404).end();
      });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), webSocketPlugin()],
  server: {
    watch: {
      ignored: ["**/server/**"],
    },
  },
});
