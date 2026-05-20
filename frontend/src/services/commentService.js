import { axiosInstance } from "./api";

// Public
export const getCarCommentsService = (carId, query) =>
  axiosInstance.get(`/comments/car/${carId}?${query}`);

export const getCommentRepliesService = (commentId, query) =>
  axiosInstance.get(`/comments/${commentId}/replies?${query}`);

// User
export const createCommentService = (data) =>
  axiosInstance.post("/comments", data);

export const updateCommentService = (id, data) =>
  axiosInstance.patch(`/comments/${id}`, data);

export const deleteCommentService = (id) =>
  axiosInstance.delete(`/comments/${id}`);

export const toggleLikeService = (id) =>
  axiosInstance.patch(`/comments/${id}/like`);

export const getMyCommentsService = () =>
  axiosInstance.get("/comments/my-comments");

// Admin
export const getAllCommentsService = (query) =>
  axiosInstance.get(`/comments?${query}`);

export const moderateCommentService = (id, status) =>
  axiosInstance.patch(`/comments/${id}/moderate`, { status });

export const adminDeleteCommentService = (id) =>
  axiosInstance.delete(`/comments/${id}/admin`);

export const replyToCommentService = (id, reply) =>
  axiosInstance.patch(`/comments/${id}/reply`, { reply });

export const buildCommentQuery = (paramsObj) => {
  const params = new URLSearchParams();
  Object.entries(paramsObj).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.append(key, value);
    }
  });
  return params.toString();
};
