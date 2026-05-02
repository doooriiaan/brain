import { Router } from "express";
import {
  assignCardsAdminRequest,
  broadcastNotificationRequest,
  getAdminDashboard,
  updateActivationStatusRequest,
  updateTicketStatusRequest,
} from "../controllers/adminController.js";

const router = Router();

router.get("/overview", getAdminDashboard);
router.post("/notifications", broadcastNotificationRequest);
router.post("/cards/assign", assignCardsAdminRequest);
router.patch("/activations/:id", updateActivationStatusRequest);
router.patch("/tickets/:id", updateTicketStatusRequest);

export default router;
