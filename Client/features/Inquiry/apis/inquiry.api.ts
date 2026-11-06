import api from "@/lib/api";
import type { IInquiry, IInquiryListResponse, IInquiryPayload, IInquiryQuery } from "../interface/inquiry.interface";

const ENDPOINT = {
  SUBMIT: () => `/public/inquiries`,
  LIST: () => `/admin/inquiries`,
  SINGLE: (id: string) => `/admin/inquiries/${id}`,
};

const submitInquiryHandler = async (data: IInquiryPayload): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(ENDPOINT.SUBMIT(), data);
  return response.data;
};

const getInquiriesHandler = async (params?: IInquiryQuery): Promise<IInquiryListResponse> => {
  const response = await api.get(ENDPOINT.LIST(), { params });
  return response.data;
};

const updateInquiryHandler = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Pick<IInquiry, "status" | "adminNotes">>;
}): Promise<{ data: IInquiry }> => {
  const response = await api.patch(ENDPOINT.SINGLE(id), data);
  return response.data;
};

const deleteInquiryHandler = async (id: string) => {
  const response = await api.delete(ENDPOINT.SINGLE(id));
  return response.data;
};

const InquiryApis = {
  submitInquiryHandler,
  getInquiriesHandler,
  updateInquiryHandler,
  deleteInquiryHandler,
};

export default InquiryApis;
