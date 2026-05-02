import { Router } from "express";
import {
  assignSmartCardsRequest,
  getAllSmartCards,
  validateSmartCardRequest,
} from "../controllers/smartCardController.js";

const router = Router();

router.get("/", getAllSmartCards);
router.post("/assign", assignSmartCardsRequest);
router.post("/validate", validateSmartCardRequest);

export default router;
