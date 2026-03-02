import express from "express";
import { createServer } from "http";
import { createRequestHandler } from "@react-router/express";
import { attachWebSocketServer } from "./ws.js";

const app = express();
app.disable("x-powered-by");

// Serve static assets from React Router build
app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" })
);
app.use(express.static("build/client", { maxAge: "1h" }));
app.use(express.static("public", { maxAge: "1h" }));

// React Router SSR handler
app.all(
  "*",
  // @ts-expect-error — dynamic import resolved at runtime after build
  createRequestHandler({ build: await import("../build/server/index.js") })
);

const httpServer = createServer(app);
attachWebSocketServer(httpServer);

const port = Number(process.env.PORT ?? 3000);
httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
