import express from "express";
import { z } from "zod";
import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";
import { idParams, reorderSchema } from "../shared/shared.validation";
import { ServiceControllers } from "./service.controller";
import { ServiceValidations } from "./service.validation";

const router = express.Router();
const withId = validateRequest(z.object({ params: idParams }));

router.use(auth());

router.get(
  "/",
  validateRequest(ServiceValidations.listServicesSchema),
  ServiceControllers.getServices,
);
router.get("/options", ServiceControllers.getServiceOptions);
router.patch("/reorder", validateRequest(reorderSchema), ServiceControllers.reorderServices);
router.post(
  "/",
  validateRequest(ServiceValidations.createServiceSchema),
  ServiceControllers.createService,
);
router.get("/:id", withId, ServiceControllers.getSingleService);
router.patch(
  "/:id",
  validateRequest(ServiceValidations.updateServiceSchema),
  ServiceControllers.updateService,
);
router.delete("/:id", withId, ServiceControllers.deleteService);

export const ServiceRoutes = router;
