import express from "express";
import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";
import { ProfileControllers } from "./profile.controller";
import { ProfileValidations } from "./profile.validation";

const router = express.Router();

router.use(auth());

router.get("/", ProfileControllers.getProfile);
router.patch(
  "/",
  validateRequest(ProfileValidations.updateProfileSchema),
  ProfileControllers.updateProfile,
);

export const ProfileRoutes = router;
