import { Router } from "express";
import {
  revealScratchCardRequest,
  validateScratchCardRequest,
  getUserScratchCardStatusRequest,
  getScratchCardRevealsRequest,
  getScratchCardStatsRequest,
} from "../controllers/scratchCardController.js";
import {
  verifyAdminToken,
  verifyClientToken,
} from "../middleware/authMiddleware.js";

const router = Router();

router.post("/reveal", verifyClientToken, revealScratchCardRequest);
router.post("/validate", verifyClientToken, validateScratchCardRequest);
router.get("/status/:userId", verifyClientToken, getUserScratchCardStatusRequest);
router.get("/reveals", verifyAdminToken, getScratchCardRevealsRequest);
router.get("/stats", verifyAdminToken, getScratchCardStatsRequest);

export default router;
