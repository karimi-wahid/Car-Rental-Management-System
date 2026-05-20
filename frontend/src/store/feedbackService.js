import { axiosInstance } from "./api";

// ================= USER =================

export const createFeedbackService = (data) =>
  axiosInstance.post("/feedback", data);

export const getCarFeedbackService = (carId, query) =>
  axiosInstance.get(`/feedback/car/${carId}?${query}`);

export const getMyFeedbackService = () =>
  axiosInstance.get("/feedback/my-reviews");

export const updateFeedbackService = (id, data) =>
  axiosInstance.patch(`/feedback/${id}`, data);

export const deleteFeedbackService = (id) =>
  axiosInstance.delete(`/feedback/${id}`);

// ================= ADMIN =================

export const getAllFeedbackService = (query) =>
  axiosInstance.get(`/feedback?${query}`);

export const moderateFeedbackService = (id, status) =>
  axiosInstance.patch(`/feedback/${id}/moderate`, { status });

export const replyToFeedbackService = (id, reply) =>
  axiosInstance.patch(`/feedback/${id}/reply`, { reply });

// ================= HELPERS =================

export const buildFeedbackQuery = (paramsObj) => {
  const params = new URLSearchParams();
  Object.entries(paramsObj).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.append(key, value);
    }
  });
  return params.toString();
};
