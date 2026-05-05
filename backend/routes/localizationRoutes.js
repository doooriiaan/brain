import { Router } from "express";
import {
  getCountriesByRegionRequest,
  getLanguageFromCountryRequest,
  validateLocalizationRequest,
} from "../controllers/localizationController.js";

const router = Router();

router.get("/countries", getCountriesByRegionRequest);
router.get("/language/:countryCode", getLanguageFromCountryRequest);
router.post("/validate", validateLocalizationRequest);

export default router;
