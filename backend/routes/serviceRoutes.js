import { Router } from "express";
import { getAllServiceStatuses } from "../controllers/serviceController.js";

const router = Router();

router.get("/status", getAllServiceStatuses);

export default router;
