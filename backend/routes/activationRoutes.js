import { Router } from "express";
import {
  createActivationRequest,
  getAllActivations,
} from "../controllers/activationController.js";

const router = Router();

router.get("/", getAllActivations);
router.post("/", createActivationRequest);

export default router;
