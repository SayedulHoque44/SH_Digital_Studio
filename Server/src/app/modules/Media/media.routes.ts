import express from "express";
import { z } from "zod";
import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";
import { idParams } from "../shared/shared.validation";
import { MediaControllers } from "./media.controller";
import { MediaValidations } from "./media.validation";

const router = express.Router();

router.use(auth());

router.get("/config", MediaControllers.getMediaConfig);
router.get("/", validateRequest(MediaValidations.listMediaSchema), MediaControllers.getMedia);
router.post("/", validateRequest(MediaValidations.createMediaSchema), MediaControllers.createMedia);
router.post(
  "/upload-url",
  validateRequest(MediaValidations.uploadUrlSchema),
  MediaControllers.createUploadUrl,
);
router.get(
  "/:id/usage",
  validateRequest(z.object({ params: idParams })),
  MediaControllers.getMediaUsage,
);
router.patch(
  "/:id",
  validateRequest(MediaValidations.updateMediaSchema),
  MediaControllers.updateMedia,
);
router.delete(
  "/:id",
  validateRequest(MediaValidations.deleteMediaSchema),
  MediaControllers.deleteMedia,
);

export const MediaRoutes = router;
