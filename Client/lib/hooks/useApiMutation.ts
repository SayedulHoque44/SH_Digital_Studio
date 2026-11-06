"use client";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";

/**
 * Generic useMutation Hook
 * @param apiFn - API function that returns a Promise of type `TResponse`
 * @param options - Optional mutation options
 */
export const useApiMutation = <TResponse, TRequest = void>(
  apiFn: (params: TRequest) => Promise<TResponse>,
  options?: UseMutationOptions<
    TResponse,
    AxiosError<{ message: string }>,
    TRequest,
    unknown
  >
) => {
  return useMutation<TResponse, AxiosError<{ message: string }>, TRequest>({
    mutationFn: async (params: TRequest) => {
      return await apiFn(params);
    },
    ...options,
  });
};
