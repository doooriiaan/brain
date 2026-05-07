import { Router } from "express";
import {
  assignCardsAdminRequest,
  broadcastNotificationRequest,
  clearHistoryRequest,
  clearNotificationsRequest,
  getAdminDashboard,
  updateActivationStatusRequest,
  updatePaymentStatusRequest,
  updateTicketStatusRequest,
} from "../controllers/adminController.js";
import { verifyAdminToken } from "../middleware/authMiddleware.js";

const router = Router();

router.use(verifyAdminToken);
router.get("/overview", getAdminDashboard);
router.post("/notifications", broadcastNotificationRequest);
router.delete("/notifications", clearNotificationsRequest);
router.delete("/history", clearHistoryRequest);
router.post("/cards/assign", assignCardsAdminRequest);
router.patch("/payments/:id", updatePaymentStatusRequest);
router.patch("/activations/:id", updateActivationStatusRequest);
router.patch("/tickets/:id", updateTicketStatusRequest);

export default router;
