import { Router } from "express";
import {
  assignCardsAdminRequest,
  broadcastNotificationRequest,
  getAdminDashboard,
  updateActivationStatusRequest,
  updateTicketStatusRequest,
} from "../controllers/adminController.js";
import { verifyAdminToken } from "../middleware/authMiddleware.js";

const router = Router();

router.use(verifyAdminToken);
router.get("/overview", getAdminDashboard);
router.post("/notifications", broadcastNotificationRequest);
router.post("/cards/assign", assignCardsAdminRequest);
router.patch("/activations/:id", updateActivationStatusRequest);
router.patch("/tickets/:id", updateTicketStatusRequest);

export default router;
