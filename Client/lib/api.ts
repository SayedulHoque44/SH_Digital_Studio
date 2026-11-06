"use client";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

/**
 * Browser API client.
 *
 * Requests go to this website's own /api/* route (app/api/[...path]/route.ts),
 * which proxies them to the Express API. Keeping everything same-origin means
 * the admin session lives in an HttpOnly, SameSite=Strict cookie that
 * JavaScript can never read - no token is stored in localStorage any more.
 */
export const api: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 30000,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // An expired/invalid admin session sends the admin back to sign in.
    // Public pages are never redirected.
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/admin") &&
      !window.location.pathname.startsWith("/admin/login")
    ) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      // The initial session check failing just means "not signed in"; any other
      // admin request failing means the session ended while the admin was working
      const sessionCheck = error.config?.url?.endsWith("/admin/auth/me");
      window.location.href = `/admin/login?next=${next}${sessionCheck ? "" : "&expired=1"}`;
    }
    return Promise.reject(error);
  },
);

export const commonThenResult = (res: AxiosResponse) => res?.data?.data;

// Readable message from an API error (falls back to a generic message)
export const apiErrorMessage = (error: unknown, fallback = "Something went wrong. Please try again.") => {
  const axiosError = error as AxiosError<{ message?: string }>;
  if (axiosError?.code === "ECONNABORTED") return "The request timed out. Please try again.";
  if (!axiosError?.response) return "Can't reach the server. Check your connection and try again.";
  return axiosError.response.data?.message || fallback;
};

// Field-level errors returned by the API's validation layer
export const apiFieldErrors = (error: unknown): Record<string, string> => {
  const sources = (error as AxiosError<{ errorSources?: { path: string | number; message: string }[] }>)?.response?.data
    ?.errorSources;
  return Object.fromEntries(
    (sources || []).filter((item) => item.path !== "").map((item) => [String(item.path), item.message]),
  );
};

export default api;
