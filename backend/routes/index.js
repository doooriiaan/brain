import { Router } from "express";
import activationRoutes from "./activationRoutes.js";
import healthRoutes from "./healthRoutes.js";
import contentRoutes from "./contentRoutes.js";
import leadRoutes from "./leadRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import operationsRoutes from "./operationsRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import ticketRoutes from "./ticketRoutes.js";
import uploadRoutes from "./uploadRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/content", contentRoutes);
router.use("/leads", leadRoutes);
router.use("/notifications", notificationRoutes);
router.use("/operations", operationsRoutes);
router.use("/services", serviceRoutes);
router.use("/activations", activationRoutes);
router.use("/tickets", ticketRoutes);
router.use("/uploads", uploadRoutes);

export default router;
