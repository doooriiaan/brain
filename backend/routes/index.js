import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import contentRoutes from "./contentRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import uploadRoutes from "./uploadRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/content", contentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/services", serviceRoutes);
router.use("/uploads", uploadRoutes);

export default router;
