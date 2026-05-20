import { axiosInstance } from "./api";

// Get User Favorites
export const getUserFavoritesService = (userData) =>
  axiosInstance.get("/favorites", userData);

// Add Favorite
export const addFavoriteService = (carId) =>
  axiosInstance.post(`/favorites/${carId}`);

// Add Favorite
export const removeFavoriteService = (carId) =>
  axiosInstance.delete(`/favorites/${carId}`);
