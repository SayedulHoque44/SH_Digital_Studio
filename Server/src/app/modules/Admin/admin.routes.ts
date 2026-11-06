import express from "express";
import auth from "../../../middlewares/auth";
import { ConfigLimiter } from "../../../middlewares/RateLimiter/CreateRateLimiter";
import validateRequest from "../../../middlewares/validateRequest";
import { AdminControllers } from "./admin.controller";
import { AdminValidations } from "./admin.validation";

const router = express.Router();

// There is intentionally no registration endpoint. The first admin is created
// with `npm run seed:admin` (see Server/README.md).
router.post(
  "/login",
  ConfigLimiter.auth,
  validateRequest(AdminValidations.loginSchema),
  AdminControllers.login,
);
router.post("/logout", AdminControllers.logout);

router.get("/me", auth(), AdminControllers.getMe);
router.patch(
  "/me",
  auth(),
  validateRequest(AdminValidations.updateMeSchema),
  AdminControllers.updateMe,
);
router.patch(
  "/password",
  auth(),
  ConfigLimiter.auth,
  validateRequest(AdminValidations.changePasswordSchema),
  AdminControllers.changePassword,
);
router.post("/logout-all", auth(), AdminControllers.logoutEverywhere);

export const AdminAuthRoutes = router;
