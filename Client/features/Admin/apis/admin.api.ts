import api from "@/lib/api";
import type {
  IAdminCategory,
  IAdminProject,
  IAdminService,
  IAdminUser,
  IApiResponse,
  IClientProject,
  IDashboardData,
  IMediaAsset,
  IMediaConfig,
  IOption,
  IPaginatedResponse,
  IPaymentPayload,
} from "../interface/admin.interface";

/*
 * Admin API calls (all go through the same-origin /api proxy with the
 * HttpOnly session cookie). One small handler per endpoint, grouped by area,
 * following the ENDPOINT + handler pattern used across this project.
 */

const ENDPOINT = {
  AUTH: (path = "") => `/admin/auth${path}`,
  DASHBOARD: () => `/admin/dashboard`,
  PROJECTS: (path = "") => `/admin/projects${path}`,
  CATEGORIES: (path = "") => `/admin/categories${path}`,
  SERVICES: (path = "") => `/admin/services${path}`,
  PROFILE: () => `/admin/profile`,
  SETTINGS: (path = "") => `/admin/settings${path}`,
  MEDIA: (path = "") => `/admin/media${path}`,
  CLIENTS: (path = "") => `/admin/clients${path}`,
};

const data = <T>(promise: Promise<{ data: IApiResponse<T> }>) => promise.then((response) => response.data.data);

// ----------------------------- Auth -----------------------------
const AuthApis = {
  login: (payload: { email: string; password: string }) => data<IAdminUser>(api.post(ENDPOINT.AUTH("/login"), payload)),
  logout: () => data<null>(api.post(ENDPOINT.AUTH("/logout"))),
  logoutEverywhere: () => data<null>(api.post(ENDPOINT.AUTH("/logout-all"))),
  me: () => data<IAdminUser>(api.get(ENDPOINT.AUTH("/me"))),
  updateMe: (payload: { name: string }) => data<IAdminUser>(api.patch(ENDPOINT.AUTH("/me"), payload)),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    data<IAdminUser>(api.patch(ENDPOINT.AUTH("/password"), payload)),
};

// ----------------------------- Dashboard -----------------------------
const DashboardApis = {
  get: () => data<IDashboardData>(api.get(ENDPOINT.DASHBOARD())),
};

// ----------------------------- Projects -----------------------------
const ProjectApis = {
  list: (params: Record<string, unknown>) => data<IPaginatedResponse<IAdminProject>>(api.get(ENDPOINT.PROJECTS(), { params })),
  options: () => data<IOption[]>(api.get(ENDPOINT.PROJECTS("/options"))),
  get: (id: string) => data<IAdminProject>(api.get(ENDPOINT.PROJECTS(`/${id}`))),
  create: (payload: Partial<IAdminProject>) => data<IAdminProject>(api.post(ENDPOINT.PROJECTS(), payload)),
  update: ({ id, payload }: { id: string; payload: Partial<IAdminProject> }) =>
    data<IAdminProject>(api.patch(ENDPOINT.PROJECTS(`/${id}`), payload)),
  duplicate: (id: string) => data<IAdminProject>(api.post(ENDPOINT.PROJECTS(`/${id}/duplicate`))),
  remove: (id: string) => data<null>(api.delete(ENDPOINT.PROJECTS(`/${id}`))),
  reorder: (ids: string[]) => data<null>(api.patch(ENDPOINT.PROJECTS("/reorder"), { ids })),
};

// ----------------------------- Categories -----------------------------
const CategoryApis = {
  list: (params: Record<string, unknown> = {}) =>
    data<IPaginatedResponse<IAdminCategory>>(api.get(ENDPOINT.CATEGORIES(), { params })),
  options: () => data<IOption[]>(api.get(ENDPOINT.CATEGORIES("/options"))),
  get: (id: string) => data<IAdminCategory>(api.get(ENDPOINT.CATEGORIES(`/${id}`))),
  create: (payload: Partial<IAdminCategory>) => data<IAdminCategory>(api.post(ENDPOINT.CATEGORIES(), payload)),
  update: ({ id, payload }: { id: string; payload: Partial<IAdminCategory> }) =>
    data<IAdminCategory>(api.patch(ENDPOINT.CATEGORIES(`/${id}`), payload)),
  deleteImpact: (id: string) =>
    data<{ projectCount: number; publishedProjectCount: number; childCount: number }>(
      api.get(ENDPOINT.CATEGORIES(`/${id}/delete-impact`)),
    ),
  remove: (id: string) => data<null>(api.delete(ENDPOINT.CATEGORIES(`/${id}`))),
  reorder: (ids: string[]) => data<null>(api.patch(ENDPOINT.CATEGORIES("/reorder"), { ids })),
};

// ----------------------------- Services -----------------------------
const ServiceApis = {
  list: (params: Record<string, unknown> = {}) =>
    data<IPaginatedResponse<IAdminService>>(api.get(ENDPOINT.SERVICES(), { params })),
  options: () => data<IOption[]>(api.get(ENDPOINT.SERVICES("/options"))),
  get: (id: string) => data<IAdminService>(api.get(ENDPOINT.SERVICES(`/${id}`))),
  create: (payload: Partial<IAdminService>) => data<IAdminService>(api.post(ENDPOINT.SERVICES(), payload)),
  update: ({ id, payload }: { id: string; payload: Partial<IAdminService> }) =>
    data<IAdminService>(api.patch(ENDPOINT.SERVICES(`/${id}`), payload)),
  remove: (id: string) => data<null>(api.delete(ENDPOINT.SERVICES(`/${id}`))),
  reorder: (ids: string[]) => data<null>(api.patch(ENDPOINT.SERVICES("/reorder"), { ids })),
};

// ----------------------------- Profile & settings -----------------------------
const ProfileApis = {
  get: () => data<Record<string, any>>(api.get(ENDPOINT.PROFILE())),
  update: (payload: Record<string, any>) => data<Record<string, any>>(api.patch(ENDPOINT.PROFILE(), payload)),
};

const SettingsApis = {
  get: () => data<Record<string, any>>(api.get(ENDPOINT.SETTINGS())),
  update: (payload: Record<string, any>) => data<Record<string, any>>(api.patch(ENDPOINT.SETTINGS(), payload)),
  integrations: () =>
    data<{ emailNotifications: boolean; mediaUploads: boolean }>(api.get(ENDPOINT.SETTINGS("/integrations"))),
};

// ----------------------------- Media -----------------------------
const MediaApis = {
  config: () => data<IMediaConfig>(api.get(ENDPOINT.MEDIA("/config"))),
  list: (params: Record<string, unknown>) => data<IPaginatedResponse<IMediaAsset>>(api.get(ENDPOINT.MEDIA(), { params })),
  create: (payload: Partial<IMediaAsset>) => data<IMediaAsset>(api.post(ENDPOINT.MEDIA(), payload)),
  update: ({ id, payload }: { id: string; payload: Partial<IMediaAsset> }) =>
    data<IMediaAsset>(api.patch(ENDPOINT.MEDIA(`/${id}`), payload)),
  usage: (id: string) => data<{ count: number; usedIn: string[] }>(api.get(ENDPOINT.MEDIA(`/${id}/usage`))),
  remove: ({ id, force }: { id: string; force?: boolean }) =>
    data<null>(api.delete(ENDPOINT.MEDIA(`/${id}`), { params: force ? { force: "true" } : {} })),
  uploadUrl: (payload: { fileName: string; contentType: string; sizeBytes: number }) =>
    data<{ uploadUrl: string; key: string; publicUrl: string }>(api.post(ENDPOINT.MEDIA("/upload-url"), payload)),
};

// ----------------------------- Client projects -----------------------------
const ClientApis = {
  list: (params: Record<string, unknown> = {}) => data<IClientProject[]>(api.get(ENDPOINT.CLIENTS(), { params })),
  get: (id: string) => data<IClientProject>(api.get(ENDPOINT.CLIENTS(`/${id}`))),
  create: (payload: Partial<IClientProject>) => data<IClientProject>(api.post(ENDPOINT.CLIENTS(), payload)),
  update: ({ id, payload }: { id: string; payload: Partial<IClientProject> }) =>
    data<IClientProject>(api.patch(ENDPOINT.CLIENTS(`/${id}`), payload)),
  remove: (id: string) => data<null>(api.delete(ENDPOINT.CLIENTS(`/${id}`))),
  recordPayment: ({ id, renewalId, payload }: { id: string; renewalId: string; payload: IPaymentPayload }) =>
    data<IClientProject>(api.post(ENDPOINT.CLIENTS(`/${id}/renewals/${renewalId}/payments`), payload)),
};

const AdminApis = {
  AuthApis,
  DashboardApis,
  ProjectApis,
  CategoryApis,
  ServiceApis,
  ProfileApis,
  SettingsApis,
  MediaApis,
  ClientApis,
};

export default AdminApis;
