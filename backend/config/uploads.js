import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsDirectory = path.resolve(__dirname, "..", "uploads");

fs.mkdirSync(uploadsDirectory, { recursive: true });

const uploadStorage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadsDirectory);
  },
  filename: (_request, file, callback) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    callback(null, `${Date.now()}-${safeName}`);
  },
});

export const upload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});
