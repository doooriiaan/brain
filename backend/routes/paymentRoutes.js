import { Router } from "express";
import {
  createPaymentRequest,
  getAllPayments,
} from "../controllers/paymentController.js";

const router = Router();

router.get("/", getAllPayments);
router.post("/", createPaymentRequest);

export default router;
