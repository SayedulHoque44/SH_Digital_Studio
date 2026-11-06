"use client";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";

/**
 * Generic useQuery Hook
 * @param queryKey - Unique key for the query
 * @param apiFn - API function that returns a Promise of type `TResponse`
 * @param params - Request parameters for the API function
 * @param options - Optional query options
 */
export const useApiQuery = <TResponse, TRequest = void>(
  queryKey: unknown[],
  apiFn: (params: TRequest) => Promise<TResponse>,
  params: TRequest,
  options?: UseQueryOptions<
    TResponse,
    AxiosError<{ message: string; [key: string]: any }>
  >
) => {
  // console.log("queryKey", queryKey);
  // console.log("params", params);
  // console.log("options", options);
  return useQuery<
    TResponse,
    AxiosError<{ message: string; [key: string]: any }>
  >({
    queryKey,
    queryFn: async () => await apiFn(params),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...(options ? options : {}),
  });
};
