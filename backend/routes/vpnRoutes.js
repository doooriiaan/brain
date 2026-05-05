import { Router } from "express";
import {
  getVpnEndpointsRequest,
  getVpnSessionsRequest,
  initiateVpnConnectionRequest,
  terminateVpnConnectionRequest,
  getVpnStatusRequest,
} from "../controllers/vpnController.js";

const router = Router();

router.get("/endpoints", getVpnEndpointsRequest);
router.get("/sessions", getVpnSessionsRequest);
router.get("/status/:userId", getVpnStatusRequest);
router.post("/connect", initiateVpnConnectionRequest);
router.post("/disconnect/:sessionId", terminateVpnConnectionRequest);

export default router;
