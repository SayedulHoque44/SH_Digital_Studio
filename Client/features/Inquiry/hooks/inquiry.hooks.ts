import { UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import InquiryApis from "../apis/inquiry.api";
import type { IInquiry, IInquiryListResponse, IInquiryPayload, IInquiryQuery } from "../interface/inquiry.interface";

const useSubmitInquiry = (
  options?: UseMutationOptions<{ success: boolean; message: string }, AxiosError<{ message: string }>, IInquiryPayload>,
) => useApiMutation(InquiryApis.submitInquiryHandler, options);

const useGetInquiries = (params: IInquiryQuery) =>
  useApiQuery<IInquiryListResponse, IInquiryQuery>(["admin-inquiries", params], InquiryApis.getInquiriesHandler, params, {
    keepPreviousData: true,
    refetchOnMount: true,
  });

const useUpdateInquiry = () => {
  const queryClient = useQueryClient();
  return useApiMutation<{ data: IInquiry }, { id: string; data: Partial<Pick<IInquiry, "status" | "adminNotes">> }>(
    InquiryApis.updateInquiryHandler,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      },
    },
  );
};

const useDeleteInquiry = () => {
  const queryClient = useQueryClient();
  return useApiMutation<unknown, string>(InquiryApis.deleteInquiryHandler, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
};

const InquiryHooks = { useSubmitInquiry, useGetInquiries, useUpdateInquiry, useDeleteInquiry };

export default InquiryHooks;
