import { Router } from "express";
import { createUploads, getAllUploads } from "../controllers/uploadController.js";
import { upload } from "../config/uploads.js";

const router = Router();

router.get("/", getAllUploads);
router.post("/", upload.array("files", 8), createUploads);

export default router;
