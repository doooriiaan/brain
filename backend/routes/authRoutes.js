import { Router } from "express";
import {
  getAuthDemo,
  getAuthStatus,
  loginRequest,
  registerRequest,
} from "../controllers/authController.js";

const router = Router();

router.get("/demo", getAuthDemo);
router.get("/status", getAuthStatus);
router.post("/login", loginRequest);
router.post("/register", registerRequest);

export default router;
