import express from "express";
import { z } from "zod";
import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";
import { idParams, reorderSchema, slugParams } from "../shared/shared.validation";
import { ProjectControllers } from "./project.controller";
import { ProjectValidations } from "./project.validation";

const router = express.Router();

// Every project management route requires an authenticated admin.
router.use(auth());

router.get(
  "/",
  validateRequest(ProjectValidations.listProjectsSchema),
  ProjectControllers.getProjects,
);
router.get("/options", ProjectControllers.getProjectOptions);
router.get(
  "/preview/:slug",
  validateRequest(z.object({ params: slugParams })),
  ProjectControllers.previewProject,
);
router.patch("/reorder", validateRequest(reorderSchema), ProjectControllers.reorderProjects);
router.post(
  "/",
  validateRequest(ProjectValidations.createProjectSchema),
  ProjectControllers.createProject,
);
router.get(
  "/:id",
  validateRequest(z.object({ params: idParams })),
  ProjectControllers.getSingleProject,
);
router.patch(
  "/:id",
  validateRequest(ProjectValidations.updateProjectSchema),
  ProjectControllers.updateProject,
);
router.post(
  "/:id/duplicate",
  validateRequest(z.object({ params: idParams })),
  ProjectControllers.duplicateProject,
);
router.delete(
  "/:id",
  validateRequest(z.object({ params: idParams })),
  ProjectControllers.deleteProject,
);

export const ProjectRoutes = router;
