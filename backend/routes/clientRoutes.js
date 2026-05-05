import { Router } from "express";
import { getClientDashboard } from "../controllers/clientController.js";
import { verifyClientToken } from "../middleware/authMiddleware.js";

const router = Router();

router.use(verifyClientToken);
router.get("/overview", getClientDashboard);

export default router;
