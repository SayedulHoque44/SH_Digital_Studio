"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { revalidateSite } from "@/lib/revalidate";
import { errorToast, successToast } from "@/utils/toast";
import AdminApis from "../apis/admin.api";

/*
 * TanStack Query hooks for the admin dashboard, built on the project's
 * generic useApiQuery / useApiMutation helpers.
 *
 * Every content mutation:
 *  1. invalidates the related admin queries (fresh tables/forms)
 *  2. revalidates the public website cache (changes go live immediately)
 *  3. shows a toast
 */

export const ADMIN_KEYS = {
  me: ["admin-me"],
  dashboard: ["admin-dashboard"],
  projects: ["admin-projects"],
  project: (id: string) => ["admin-project", id],
  projectOptions: ["admin-project-options"],
  categories: ["admin-categories"],
  category: (id: string) => ["admin-category", id],
  categoryOptions: ["admin-category-options"],
  services: ["admin-services"],
  service: (id: string) => ["admin-service", id],
  serviceOptions: ["admin-service-options"],
  profile: ["admin-profile"],
  settings: ["admin-settings"],
  integrations: ["admin-integrations"],
  media: ["admin-media"],
  mediaConfig: ["admin-media-config"],
  clients: ["admin-clients"],
  client: (id: string) => ["admin-client", id],
};

const fresh = { refetchOnMount: true, staleTime: 0 } as const;

// Shared success handling for content mutations
const useContentMutation = <TResponse, TRequest>(
  fn: (params: TRequest) => Promise<TResponse>,
  invalidate: unknown[][],
  message?: string | ((result: TResponse) => string),
) => {
  const queryClient = useQueryClient();
  return useApiMutation<TResponse, TRequest>(fn, {
    onSuccess: async (result) => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
      void revalidateSite();
      if (message) successToast(typeof message === "function" ? message(result) : message);
    },
    onError: (error) => errorToast({ error }),
  });
};

// ----------------------------- Auth -----------------------------
const useMe = (enabled = true) =>
  useApiQuery(ADMIN_KEYS.me, AdminApis.AuthApis.me, undefined, { retry: false, enabled, ...fresh });

const useLogin = () => useApiMutation(AdminApis.AuthApis.login);

const useLogout = () => {
  const queryClient = useQueryClient();
  return useApiMutation(AdminApis.AuthApis.logout, {
    onSettled: () => queryClient.clear(),
  });
};

const useLogoutEverywhere = () => {
  const queryClient = useQueryClient();
  return useApiMutation(AdminApis.AuthApis.logoutEverywhere, {
    onSettled: () => queryClient.clear(),
  });
};

// Account changes are private, so (unlike content) they don't revalidate the website
const useUpdateMe = () => {
  const queryClient = useQueryClient();
  return useApiMutation(AdminApis.AuthApis.updateMe, {
    onSuccess: (admin) => {
      queryClient.setQueryData(ADMIN_KEYS.me, admin);
      successToast("Account updated");
    },
    onError: (error) => errorToast({ error }),
  });
};

const useChangePassword = () =>
  useApiMutation(AdminApis.AuthApis.changePassword, {
    onSuccess: () => successToast("Password updated. Other sessions were signed out."),
    onError: (error) => errorToast({ error }),
  });

// ----------------------------- Dashboard -----------------------------
const useDashboard = (enabled = true) =>
  useApiQuery(ADMIN_KEYS.dashboard, AdminApis.DashboardApis.get, undefined, { enabled, ...fresh });

// ----------------------------- Projects -----------------------------
const useProjects = (params: Record<string, unknown>) =>
  useApiQuery([...ADMIN_KEYS.projects, params], AdminApis.ProjectApis.list, params, { keepPreviousData: true, ...fresh });
const useProjectOptions = () => useApiQuery(ADMIN_KEYS.projectOptions, AdminApis.ProjectApis.options, undefined, fresh);
const useProject = (id?: string) =>
  useApiQuery(ADMIN_KEYS.project(id || "new"), () => AdminApis.ProjectApis.get(id!), undefined, { enabled: !!id, ...fresh });
const useCreateProject = () =>
  useContentMutation(AdminApis.ProjectApis.create, [ADMIN_KEYS.projects, ADMIN_KEYS.projectOptions], "Project created");
const useUpdateProject = () =>
  useContentMutation(AdminApis.ProjectApis.update, [ADMIN_KEYS.projects, ADMIN_KEYS.projectOptions], "Project saved");
const useDuplicateProject = () =>
  useContentMutation(AdminApis.ProjectApis.duplicate, [ADMIN_KEYS.projects, ADMIN_KEYS.projectOptions], "Duplicated as a draft");
const useDeleteProject = () =>
  useContentMutation(AdminApis.ProjectApis.remove, [ADMIN_KEYS.projects, ADMIN_KEYS.projectOptions], "Project deleted");
const useReorderProjects = () => useContentMutation(AdminApis.ProjectApis.reorder, [ADMIN_KEYS.projects], "Order saved");

// ----------------------------- Categories -----------------------------
const useCategories = (params: Record<string, unknown> = {}) =>
  useApiQuery([...ADMIN_KEYS.categories, params], AdminApis.CategoryApis.list, params, fresh);
const useCategoryOptions = () => useApiQuery(ADMIN_KEYS.categoryOptions, AdminApis.CategoryApis.options, undefined, fresh);
const useCategory = (id?: string) =>
  useApiQuery(ADMIN_KEYS.category(id || "new"), () => AdminApis.CategoryApis.get(id!), undefined, { enabled: !!id, ...fresh });
const useCreateCategory = () =>
  useContentMutation(AdminApis.CategoryApis.create, [ADMIN_KEYS.categories, ADMIN_KEYS.categoryOptions], "Category created");
const useUpdateCategory = () =>
  useContentMutation(AdminApis.CategoryApis.update, [ADMIN_KEYS.categories, ADMIN_KEYS.categoryOptions], "Category saved");
const useDeleteCategory = () =>
  useContentMutation(AdminApis.CategoryApis.remove, [ADMIN_KEYS.categories, ADMIN_KEYS.categoryOptions, ADMIN_KEYS.projects], "Category deleted");
const useReorderCategories = () => useContentMutation(AdminApis.CategoryApis.reorder, [ADMIN_KEYS.categories], "Order saved");

// ----------------------------- Services -----------------------------
const useServices = (params: Record<string, unknown> = {}) =>
  useApiQuery([...ADMIN_KEYS.services, params], AdminApis.ServiceApis.list, params, fresh);
const useServiceOptions = () => useApiQuery(ADMIN_KEYS.serviceOptions, AdminApis.ServiceApis.options, undefined, fresh);
const useService = (id?: string) =>
  useApiQuery(ADMIN_KEYS.service(id || "new"), () => AdminApis.ServiceApis.get(id!), undefined, { enabled: !!id, ...fresh });
const useCreateService = () =>
  useContentMutation(AdminApis.ServiceApis.create, [ADMIN_KEYS.services, ADMIN_KEYS.serviceOptions], "Service created");
const useUpdateService = () =>
  useContentMutation(AdminApis.ServiceApis.update, [ADMIN_KEYS.services, ADMIN_KEYS.serviceOptions], "Service saved");
const useDeleteService = () =>
  useContentMutation(AdminApis.ServiceApis.remove, [ADMIN_KEYS.services, ADMIN_KEYS.serviceOptions], "Service deleted");
const useReorderServices = () => useContentMutation(AdminApis.ServiceApis.reorder, [ADMIN_KEYS.services], "Order saved");

// ----------------------------- Profile & settings -----------------------------
const useProfile = () => useApiQuery(ADMIN_KEYS.profile, AdminApis.ProfileApis.get, undefined, fresh);
const useUpdateProfile = () => useContentMutation(AdminApis.ProfileApis.update, [ADMIN_KEYS.profile], "Profile saved");
const useSettings = () => useApiQuery(ADMIN_KEYS.settings, AdminApis.SettingsApis.get, undefined, fresh);
const useUpdateSettings = () => useContentMutation(AdminApis.SettingsApis.update, [ADMIN_KEYS.settings], "Settings saved");
const useIntegrations = () => useApiQuery(ADMIN_KEYS.integrations, AdminApis.SettingsApis.integrations, undefined, fresh);

// ----------------------------- Media -----------------------------
const useMediaConfig = () => useApiQuery(ADMIN_KEYS.mediaConfig, AdminApis.MediaApis.config, undefined, { staleTime: 5 * 60 * 1000 });
// `enabled` lets pickers wait until they are opened (editors render several)
const useMedia = (params: Record<string, unknown>, enabled = true) =>
  useApiQuery([...ADMIN_KEYS.media, params], AdminApis.MediaApis.list, params, { keepPreviousData: true, enabled, ...fresh });
const useCreateMedia = () => {
  const queryClient = useQueryClient();
  return useApiMutation(AdminApis.MediaApis.create, {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.media }),
    onError: (error) => errorToast({ error }),
  });
};
const useUpdateMedia = () => {
  const queryClient = useQueryClient();
  return useApiMutation(AdminApis.MediaApis.update, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.media });
      successToast("Media details saved");
    },
    onError: (error) => errorToast({ error }),
  });
};
const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useApiMutation(AdminApis.MediaApis.remove, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.media });
      successToast("Media deleted");
    },
  });
};

// ----------------------------- Client projects -----------------------------
// Private records: like account changes, they never revalidate the website
const useClientMutation = <TResponse, TRequest>(fn: (params: TRequest) => Promise<TResponse>, message: string) => {
  const queryClient = useQueryClient();
  return useApiMutation<TResponse, TRequest>(fn, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.clients });
      queryClient.invalidateQueries({ queryKey: ["admin-client"] });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard });
      successToast(message);
    },
    onError: (error) => errorToast({ error }),
  });
};
const useClientProjects = (params: Record<string, unknown> = {}) =>
  useApiQuery([...ADMIN_KEYS.clients, params], AdminApis.ClientApis.list, params, { keepPreviousData: true, ...fresh });
const useClientProject = (id?: string) =>
  useApiQuery(ADMIN_KEYS.client(id || "new"), () => AdminApis.ClientApis.get(id!), undefined, { enabled: !!id, ...fresh });
const useCreateClientProject = () => useClientMutation(AdminApis.ClientApis.create, "Client project created");
const useUpdateClientProject = () => useClientMutation(AdminApis.ClientApis.update, "Client project saved");
const useDeleteClientProject = () => useClientMutation(AdminApis.ClientApis.remove, "Client project deleted");
const useRecordPayment = () => useClientMutation(AdminApis.ClientApis.recordPayment, "Payment recorded");

const AdminHooks = {
  useMe,
  useLogin,
  useLogout,
  useLogoutEverywhere,
  useUpdateMe,
  useChangePassword,
  useDashboard,
  useProjects,
  useProjectOptions,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDuplicateProject,
  useDeleteProject,
  useReorderProjects,
  useCategories,
  useCategoryOptions,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
  useServices,
  useServiceOptions,
  useService,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useReorderServices,
  useProfile,
  useUpdateProfile,
  useSettings,
  useUpdateSettings,
  useIntegrations,
  useMediaConfig,
  useMedia,
  useCreateMedia,
  useUpdateMedia,
  useDeleteMedia,
  useClientProjects,
  useClientProject,
  useCreateClientProject,
  useUpdateClientProject,
  useDeleteClientProject,
  useRecordPayment,
};

export default AdminHooks;
