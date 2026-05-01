import { Router } from "express";
import { getAllNotifications } from "../controllers/notificationController.js";

const router = Router();

router.get("/", getAllNotifications);

export default router;
