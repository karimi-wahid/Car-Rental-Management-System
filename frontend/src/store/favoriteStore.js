import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  getUserFavoritesService,
  addFavoriteService,
  removeFavoriteService,
} from "@/services/favoriteService";

const useFavoriteStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      loading: false,
      error: null,

      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },

      // ================= FAVORITE OPERATIONS =================

      // Get all favorites
      getFavorites: async (page = 1, limit = 10) => {
        set({ loading: true, error: null });

        try {
          const res = await getUserFavoritesService();

          set({
            favorites: res.data.data.favorites,
            pagination: {
              page: res.data.page || page,
              limit,
              total: res.data.total || res.data.results || 0,
              pages: res.data.pages || 1,
            },
            loading: false,
          });

          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch favorites",
            loading: false,
          });
          throw err;
        }
      },

      // Add a car to favorites
      addFavorite: async (carId) => {
        set({ loading: true, error: null });

        try {
          const res = await addFavoriteService(carId);
          const updatedFavorites = res.data.data.favorites;

          set({
            favorites: updatedFavorites,
            loading: false,
          });

          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to add favorite",
            loading: false,
          });
          throw err;
        }
      },

      // Remove a car from favorites
      removeFavorite: async (carId) => {
        set({ loading: true, error: null });

        try {
          const res = await removeFavoriteService(carId);
          const updatedFavorites = res.data.data.favorites;

          set({
            favorites: updatedFavorites,
            loading: false,
          });

          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to remove favorite",
            loading: false,
          });
          throw err;
        }
      },

      // Toggle favorite (add if not exists, remove if exists)
      toggleFavorite: async (carId, isCurrentlyFavorite) => {
        // Optimistically update UI immediately
        const { favorites } = get();
        set({
          favorites: isCurrentlyFavorite
            ? favorites.filter((car) => car._id !== carId)
            : [...favorites, { _id: carId }], // placeholder until server responds
          error: null,
        });

        try {
          const res = isCurrentlyFavorite
            ? await removeFavoriteService(carId)
            : await addFavoriteService(carId);

          // Replace with real server data
          set({ favorites: res.data.data.favorites });
          return res.data;
        } catch (err) {
          // Roll back on failure
          set({ favorites, error: err.response?.data?.message || "Failed" });
          throw err;
        }
      },

      // ================= UTILS =================

      // Check if a car is favorite (synchronous, uses current state)
      isFavorite: (carId) => {
        const { favorites } = get();
        return favorites.some((car) => car._id === carId);
      },

      // Get favorite count
      getFavoriteCount: () => {
        const { favorites } = get();
        return favorites.length;
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Reset store
      reset: () => {
        set({
          favorites: [],
          loading: false,
          error: null,
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
          },
        });
      },
    }),
    {
      name: "favorite-storage",
      partialize: (state) => ({}),
    },
  ),
);

export default useFavoriteStore;
