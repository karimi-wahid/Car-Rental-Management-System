import { axiosInstance } from "./api";

// Build query string (important for clean code)
const buildCarQuery = ({ page, limit, filters, sort }) => {
  const params = new URLSearchParams();

  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (sort) params.append("sort", sort);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined) {
        const map = {
          model: "carModel",
        };
        params.append(map[key] || key, value);
      }
    });
  }

  return params.toString();
};

// ================= API =================

export const getCarsService = (query) => axiosInstance.get(`/cars?${query}`);

export const getCarByIdService = (id) => axiosInstance.get(`/cars/${id}`);

export const createCarService = (data) =>
  axiosInstance.post("/cars", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateCarService = (id, data) =>
  axiosInstance.patch(`/cars/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteCarService = (id, permanent) =>
  axiosInstance.delete(`/cars/${id}${permanent ? "?permanent=true" : ""}`);

export const toggleAvailabilityService = (id) =>
  axiosInstance.patch(`/cars/${id}/toggle-availability`);

export const getCarStatsService = (period, carId) =>
  axiosInstance.get(
    `/cars/statistics?period=${period}${carId ? `&carId=${carId}` : ""}`,
  );

export const getBrandsService = () =>
  axiosInstance.get("/cars/brands?includeCounts=true&includeModels=true");

export const getFilterOptionsService = () => axiosInstance.get("/cars?limit=1");

export { buildCarQuery };
