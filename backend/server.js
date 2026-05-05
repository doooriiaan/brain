import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { initializeSocketServer } from "./services/realtimeService.js";

const port = Number(process.env.PORT ?? 5000);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN
      ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
      : "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize real-time socket connections
initializeSocketServer(io);

// Make io accessible to routes if needed
app.locals.io = io;

server.listen(port, () => {
  console.log(`brAIn backend is running on http://localhost:${port}`);
  console.log(`WebSocket server ready for real-time connections`);
});
