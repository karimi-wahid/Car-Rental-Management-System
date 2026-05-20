import { axiosInstance } from "./api";

// ================= USER =================

export const createBookingService = (data) =>
  axiosInstance.post("/bookings", data);

export const getUserBookingsService = (query) =>
  axiosInstance.get(`/bookings/my-bookings?${query}`);

export const getUserBookingsHistoryService = (query) =>
  axiosInstance.get(`/bookings/my-bookings-history?${query}`);

export const getBookingByIdService = (id) =>
  axiosInstance.get(`/bookings/${id}`);

export const updateBookingService = (id, data) =>
  axiosInstance.patch(`/bookings/${id}`, data);

export const cancelBookingService = (id, data) =>
  axiosInstance.patch(`/bookings/${id}/cancel`, data);

export const checkAvailabilityService = (query) =>
  axiosInstance.get(`/bookings/check-availability?${query}`);

export const getTimeSlotsService = (query) =>
  axiosInstance.get(`/bookings/time-slots?${query}`);

// ================= ADMIN =================

export const getAllBookingsService = (query) =>
  axiosInstance.get(`/bookings?${query}`);

export const updateBookingStatusService = (id, data) =>
  axiosInstance.patch(`/bookings/${id}/status`, data);

export const getBookingStatsService = (query) =>
  axiosInstance.get(`/bookings/statistics?${query}`);

// ================= HELPERS =================

export const buildBookingQuery = (paramsObj) => {
  const params = new URLSearchParams();

  Object.entries(paramsObj).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.append(key, value);
    }
  });

  return params.toString();
};
