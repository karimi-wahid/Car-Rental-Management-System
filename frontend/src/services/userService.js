import { axiosInstance } from "./api";

// Current user
export const getMeService = () => axiosInstance.get("/users/me");

export const updateMeService = (data) =>
  axiosInstance.patch("/users/updateMe", data);

export const deleteMeService = () => axiosInstance.delete("/users/deleteMe");

// Admin
export const getAllUsersService = (page, limit) =>
  axiosInstance.get(`/users?page=${page}&limit=${limit}`);

export const getUserService = (id) => axiosInstance.get(`/users/${id}`);

export const createUserService = (data) => axiosInstance.post("/users", data);

export const updateUserService = (id, data) =>
  axiosInstance.patch(`/users/${id}`, data);

export const deleteUserService = (id) => axiosInstance.delete(`/users/${id}`);

export const updateUserRoleService = (id, data) =>
  axiosInstance.patch(`/users/${id}/role`, data);

export const toggleUserActiveService = (id) =>
  axiosInstance.patch(`/users/${id}/toggle-active`);
