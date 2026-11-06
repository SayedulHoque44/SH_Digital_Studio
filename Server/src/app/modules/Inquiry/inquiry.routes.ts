import express from "express";
import { z } from "zod";
import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";
import { idParams } from "../shared/shared.validation";
import { InquiryControllers } from "./inquiry.controller";
import { InquiryValidations } from "./inquiry.validation";

// Admin routes only. The public submission endpoint lives in public.routes.ts
const router = express.Router();
const withId = validateRequest(z.object({ params: idParams }));

router.use(auth());

router.get(
  "/",
  validateRequest(InquiryValidations.listInquiriesSchema),
  InquiryControllers.getInquiries,
);
router.get("/:id", withId, InquiryControllers.getSingleInquiry);
router.patch(
  "/:id",
  validateRequest(InquiryValidations.updateInquirySchema),
  InquiryControllers.updateInquiry,
);
router.delete("/:id", withId, InquiryControllers.deleteInquiry);

export const InquiryRoutes = router;
