import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import apiRouter from "./routes/index.js";
import { uploadsDirectory } from "./config/uploads.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDirectory = path.resolve(__dirname, "..");
const distDirectory = path.resolve(rootDirectory, "dist");

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN
      ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
      : true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(uploadsDirectory));
app.use("/api", apiRouter);
app.use("/api", notFoundHandler);

app.use(express.static(distDirectory));

app.get("/{*splat}", (request, response, next) => {
  if (request.path.startsWith("/api")) {
    next();
    return;
  }

  response.sendFile(path.join(distDirectory, "index.html"));
});

app.use(errorHandler);

export default app;
