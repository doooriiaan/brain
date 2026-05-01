import { Router } from "express";
import {
  createTicketRequest,
  getAllTickets,
} from "../controllers/ticketController.js";

const router = Router();

router.get("/", getAllTickets);
router.post("/", createTicketRequest);

export default router;
