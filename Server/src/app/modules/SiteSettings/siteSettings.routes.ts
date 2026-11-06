import express from "express";
import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";
import { SiteSettingsControllers } from "./siteSettings.controller";
import { SiteSettingsValidations } from "./siteSettings.validation";

const router = express.Router();

router.use(auth());

router.get("/", SiteSettingsControllers.getSettings);
router.get("/integrations", SiteSettingsControllers.getIntegrations);
router.patch(
  "/",
  validateRequest(SiteSettingsValidations.updateSettingsSchema),
  SiteSettingsControllers.updateSettings,
);

export const SiteSettingsRoutes = router;
