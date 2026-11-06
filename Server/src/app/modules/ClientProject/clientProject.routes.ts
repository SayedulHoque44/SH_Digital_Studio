import express from "express";
import { z } from "zod";
import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";
import { idParams } from "../shared/shared.validation";
import { ClientProjectControllers } from "./clientProject.controller";
import { ClientProjectValidations } from "./clientProject.validation";

// Admin only - nothing here is ever served publicly
const router = express.Router();
const withId = validateRequest(z.object({ params: idParams }));

router.use(auth());

router.get(
  "/",
  validateRequest(ClientProjectValidations.listClientProjectsSchema),
  ClientProjectControllers.getClientProjects,
);
router.post(
  "/",
  validateRequest(ClientProjectValidations.createClientProjectSchema),
  ClientProjectControllers.createClientProject,
);
router.get("/:id", withId, ClientProjectControllers.getSingleClientProject);
router.patch(
  "/:id",
  validateRequest(ClientProjectValidations.updateClientProjectSchema),
  ClientProjectControllers.updateClientProject,
);
router.delete("/:id", withId, ClientProjectControllers.deleteClientProject);
router.post(
  "/:id/renewals/:renewalId/payments",
  validateRequest(ClientProjectValidations.recordPaymentSchema),
  ClientProjectControllers.recordPayment,
);

export const ClientProjectRoutes = router;

