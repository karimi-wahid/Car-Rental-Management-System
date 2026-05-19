import { axiosInstance } from "./api";

export const createContactService = (data) =>
  axiosInstance.post("/contact", data);

export const getAllContactsService = (query) =>
  axiosInstance.get(`/contact?${query}`);

export const getContactByIdService = (id) =>
  axiosInstance.get(`/contact/${id}`);

export const replyToContactService = (id, reply) =>
  axiosInstance.patch(`/contact/${id}/reply`, { reply });

export const updateContactStatusService = (id, status) =>
  axiosInstance.patch(`/contact/${id}/status`, { status });

export const markAsSpamService = (id) =>
  axiosInstance.patch(`/contact/${id}/spam`);

export const deleteContactService = (id) =>
  axiosInstance.delete(`/contact/${id}`);

export const buildContactQuery = (paramsObj) => {
  const params = new URLSearchParams();
  Object.entries(paramsObj).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.append(key, value);
    }
  });
  return params.toString();
};
