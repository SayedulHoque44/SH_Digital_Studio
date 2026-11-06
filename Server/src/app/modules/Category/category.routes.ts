import express from "express";
import { z } from "zod";
import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";
import { idParams, reorderSchema } from "../shared/shared.validation";
import { CategoryControllers } from "./category.controller";
import { CategoryValidations } from "./category.validation";

const router = express.Router();
const withId = validateRequest(z.object({ params: idParams }));

router.use(auth());

router.get(
  "/",
  validateRequest(CategoryValidations.listCategoriesSchema),
  CategoryControllers.getCategories,
);
router.get("/options", CategoryControllers.getCategoryOptions);
router.patch("/reorder", validateRequest(reorderSchema), CategoryControllers.reorderCategories);
router.post(
  "/",
  validateRequest(CategoryValidations.createCategorySchema),
  CategoryControllers.createCategory,
);
router.get("/:id", withId, CategoryControllers.getSingleCategory);
router.get("/:id/delete-impact", withId, CategoryControllers.getDeleteImpact);
router.patch(
  "/:id",
  validateRequest(CategoryValidations.updateCategorySchema),
  CategoryControllers.updateCategory,
);
router.delete("/:id", withId, CategoryControllers.deleteCategory);

export const CategoryRoutes = router;
