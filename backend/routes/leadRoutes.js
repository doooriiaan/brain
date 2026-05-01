import { Router } from "express";
import { createLeadRequest, getAllLeads } from "../controllers/leadController.js";

const router = Router();

router.get("/", getAllLeads);
router.post("/", createLeadRequest);

export default router;
