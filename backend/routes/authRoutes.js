import { Router } from "express";
import {
  changePasswordRequest,
  getCurrentSession,
  getAuthDemo,
  getAuthStatus,
  loginRequest,
  registerRequest,
  updateProfileRequest,
} from "../controllers/authController.js";
import { verifySessionToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/demo", getAuthDemo);
router.get("/status", getAuthStatus);
router.post("/login", loginRequest);
router.post("/register", registerRequest);
router.get("/me", verifySessionToken, getCurrentSession);
router.patch("/profile", verifySessionToken, updateProfileRequest);
router.patch("/password", verifySessionToken, changePasswordRequest);

export default router;
