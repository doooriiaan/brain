import { Router } from "express";
import { getClientDashboard } from "../controllers/clientController.js";

const router = Router();

router.get("/overview", getClientDashboard);

export default router;
