import { Router } from "express";
import verifyOrigin from "../../middlewares/verifyOrigin";
import { AdminAuthRoutes } from "../modules/Admin/admin.routes";
import { CategoryRoutes } from "../modules/Category/category.routes";
import { ClientProjectRoutes } from "../modules/ClientProject/clientProject.routes";
import { DashboardRoutes } from "../modules/Dashboard/dashboard.routes";
import { InquiryRoutes } from "../modules/Inquiry/inquiry.routes";
import { MediaRoutes } from "../modules/Media/media.routes";
import { ProfileRoutes } from "../modules/Profile/profile.routes";
import { ProjectRoutes } from "../modules/Project/project.routes";
import { PublicRoutes } from "../modules/Public/public.routes";
import { ServiceRoutes } from "../modules/Service/service.routes";
import { SiteSettingsRoutes } from "../modules/SiteSettings/siteSettings.routes";

const router = Router();

// Public website content (read-only) + inquiry submission
const publicRoutes = [{ path: "/public", route: PublicRoutes }];

// Admin CMS. Every module router applies the `auth()` middleware itself
// (except /admin/auth/login), so authorization is always enforced server-side.
const adminRoutes = [
  { path: "/admin/auth", route: AdminAuthRoutes },
  { path: "/admin/dashboard", route: DashboardRoutes },
  { path: "/admin/projects", route: ProjectRoutes },
  { path: "/admin/categories", route: CategoryRoutes },
  { path: "/admin/services", route: ServiceRoutes },
  { path: "/admin/profile", route: ProfileRoutes },
  { path: "/admin/settings", route: SiteSettingsRoutes },
  { path: "/admin/media", route: MediaRoutes },
  { path: "/admin/inquiries", route: InquiryRoutes },
  { path: "/admin/clients", route: ClientProjectRoutes },
];

publicRoutes.forEach(route => router.use(route.path, verifyOrigin, route.route));
adminRoutes.forEach(route => router.use(route.path, verifyOrigin, route.route));

export default router;
