import express from "express";
import fs from "node:fs";
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
const publicDirectory = path.resolve(rootDirectory, "public");

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN
      ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
      : true,
  }),
);
app.use(express.json());
function sendUploadedFile(request, response) {
  const fileName = path.basename(request.params.filename ?? "");
  const filePath = path.join(uploadsDirectory, fileName);

  if (!fs.existsSync(filePath)) {
    response.status(404).json({
      message: "Uploaded file not found.",
    });
    return;
  }

  response.sendFile(filePath);
}

app.get("/uploads/:filename", sendUploadedFile);
app.get("/api/uploads/:filename", sendUploadedFile);

app.use("/api", apiRouter);
app.use("/api", notFoundHandler);

if (!process.env.VERCEL) {
  const spaDirectory = fs.existsSync(path.join(distDirectory, "index.html"))
    ? distDirectory
    : publicDirectory;

  app.use(express.static(spaDirectory));

  app.get("/{*splat}", (request, response, next) => {
    if (request.path.startsWith("/api") || request.path.startsWith("/uploads")) {
      next();
      return;
    }

    response.sendFile(path.join(spaDirectory, "index.html"));
  });
}

app.use(errorHandler);

export default app;
