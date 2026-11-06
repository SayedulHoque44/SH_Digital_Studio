import express from "express";
import { z } from "zod";
import { ConfigLimiter } from "../../../middlewares/RateLimiter/CreateRateLimiter";
import validateRequest from "../../../middlewares/validateRequest";
import { InquiryControllers } from "../Inquiry/inquiry.controller";
import { InquiryValidations } from "../Inquiry/inquiry.validation";
import { PROJECT_TYPES } from "../Project/project.constant";
import { slugParams } from "../shared/shared.validation";
import { PublicControllers } from "./public.controller";

// Read-only content for the public website (published data only) plus the
// inquiry form submission. No authentication.
const router = express.Router();
const withSlug = validateRequest(z.object({ params: slugParams }));

router.get("/settings", PublicControllers.getSettings);
router.get("/home", PublicControllers.getHome);
router.get(
  "/legal/:doc",
  validateRequest(z.object({ params: z.object({ doc: z.enum(["privacy", "terms"]) }) })),
  PublicControllers.getLegalPage,
);

router.get(
  "/projects",
  validateRequest(
    z.object({
      query: z.object({
        type: z.enum(PROJECT_TYPES).optional(),
        category: z.string().trim().toLowerCase().max(80).optional(),
        featured: z.enum(["true", "false"]).optional(),
        searchTerm: z.string().trim().max(100).optional(),
        sort: z.enum(["featured", "newest", "oldest", "title", "order"]).optional(),
        page: z.coerce.number().int().min(1).max(1000).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
      }),
    }),
  ),
  PublicControllers.getProjects,
);
router.get("/projects/:slug", withSlug, PublicControllers.getProject);

router.get("/categories", PublicControllers.getCategories);
router.get("/categories/:slug", withSlug, PublicControllers.getCategory);

router.get("/services", PublicControllers.getServices);
router.get("/services/:slug", withSlug, PublicControllers.getService);

router.get("/profile", PublicControllers.getProfile);
router.get("/sitemap", PublicControllers.getSitemap);

router.post(
  "/inquiries",
  ConfigLimiter.inquiry,
  validateRequest(InquiryValidations.createInquirySchema),
  InquiryControllers.createInquiry,
);

export const PublicRoutes = router;
