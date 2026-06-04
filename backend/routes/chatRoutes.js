import { Router } from "express";
import { createFrontPageChat } from "../controllers/chatController.js";

const router = Router();

router.post("/front-page", createFrontPageChat);

export default router;
