import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  getCarsService,
  getCarByIdService,
  createCarService,
  updateCarService,
  deleteCarService,
  toggleAvailabilityService,
  getCarStatsService,
  getBrandsService,
  getFilterOptionsService,
  buildCarQuery,
} from "@/services/carService";

const useCarStore = create(
  persist(
    (set, get) => ({
      cars: [],
      filteredCars: [],
      selectedCar: null,
      brands: [],
      carStats: null,

      loading: false,
      error: null,

      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 12,
      },

      filters: {
        brand: "",
        model: "",
        minPrice: "",
        maxPrice: "",
        transmission: "",
        fuelType: "",
        seats: "",
        minYear: "",
        maxYear: "",
        search: "",
        availability: true,
      },

      sort: "-createdAt",

      availableFilters: {
        brands: [],
        models: [],
        transmissions: [],
        fuelTypes: [],
        seats: [],
        years: [],
        priceRange: { min: 0, max: 1000 },
      },

      // ================= FETCH =================

      fetchCars: async (page = 1, limit = 12) => {
        set({ loading: true, error: null });

        try {
          const { filters, sort } = get();

          const query = buildCarQuery({
            page,
            limit,
            filters,
            sort,
          });

          const res = await getCarsService(query);

          set({
            cars: res.data.data.cars,
            filteredCars: res.data.data.cars,
            pagination: {
              currentPage: res.data.pagination?.currentPage || page,
              totalPages: res.data.pagination?.totalPages || 1,
              totalItems:
                res.data.pagination?.totalItems || res.data.results || 0,
              itemsPerPage: limit,
            },
            availableFilters:
              res.data.filters?.available || get().availableFilters,
            loading: false,
          });

          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message,
            loading: false,
          });
          throw err;
        }
      },

      fetchCarById: async (id) => {
        set({ loading: true, error: null });

        try {
          const res = await getCarByIdService(id);

          set({
            selectedCar: res.data.data.car,
            loading: false,
          });

          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message,
            loading: false,
          });
          throw err;
        }
      },

      createCar: async (data) => {
        set({ loading: true, error: null });
        try {
          const res = await createCarService(data);
          set((state) => ({
            cars: [res.data.data.car, ...state.cars],
            filteredCars: [res.data.data.car, ...state.filteredCars],
            loading: false,
          }));
          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to create car",
            loading: false,
          });
          throw err;
        }
      },

      updateCar: async (id, data) => {
        set({ loading: true, error: null });

        try {
          const res = await updateCarService(id, data);
          const updated = res.data.data.car;

          set((state) => ({
            cars: state.cars.map((c) => (c._id === id ? updated : c)),
            filteredCars: state.filteredCars.map((c) =>
              c._id === id ? updated : c,
            ),
            selectedCar:
              state.selectedCar?._id === id ? updated : state.selectedCar,
            loading: false,
          }));

          return res.data;
        } catch (err) {
          set({ error: err.response?.data?.message, loading: false });
          throw err;
        }
      },

      deleteCar: async (id, permanent = false) => {
        set({ loading: true, error: null });

        try {
          await deleteCarService(id, permanent);

          set((state) => ({
            cars: state.cars.filter((c) => c._id !== id),
            filteredCars: state.filteredCars.filter((c) => c._id !== id),
            loading: false,
          }));
        } catch (err) {
          set({ error: err.response?.data?.message, loading: false });
          throw err;
        }
      },

      toggleAvailability: async (id) => {
        set({ loading: true, error: null });
        try {
          console.log("Toggle", id);
          const res = await toggleAvailabilityService(id);
          console.log("Toggle Res", res);
          const updated = res.data.data.car;

          set((state) => ({
            cars: state.cars.map((c) =>
              c._id === id ? { ...c, ...updated } : c,
            ),
            filteredCars: state.filteredCars.map((c) =>
              c._id === id ? { ...c, ...updated } : c,
            ),
            selectedCar:
              state.selectedCar?._id === id
                ? { ...state.selectedCar, ...updated }
                : state.selectedCar,
            loading: false,
          }));

          return res.data;
        } catch (err) {
          set({
            error:
              err.response?.data?.message || "Failed to toggle availability",
            loading: false,
          });
          throw err;
        }
      },

      fetchCarStats: async (period = "month", carId = null) => {
        set({ loading: true, error: null });
        try {
          const res = await getCarStatsService(period, carId);
          set({ carStats: res.data.data, loading: false });
          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch stats",
            loading: false,
          });
          throw err;
        }
      },

      fetchBrands: async () => {
        set({ loading: true, error: null });
        try {
          const res = await getBrandsService();
          set({ brands: res.data.data.brands, loading: false });
          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch brands",
            loading: false,
          });
          throw err;
        }
      },

      fetchFilterOptions: async () => {
        set({ loading: true, error: null });
        try {
          const res = await getFilterOptionsService();
          set({
            availableFilters:
              res.data.filters?.available || get().availableFilters,
            loading: false,
          });
          return res.data;
        } catch (err) {
          set({
            error:
              err.response?.data?.message || "Failed to fetch filter options",
            loading: false,
          });
          throw err;
        }
      },

      // ================= UTILS =================

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      clearFilters: () =>
        set({
          filters: {
            brand: "",
            model: "",
            minPrice: "",
            maxPrice: "",
            transmission: "",
            fuelType: "",
            seats: "",
            minYear: "",
            maxYear: "",
            search: "",
            availability: true,
          },
        }),

      setSort: (sort) => set({ sort }),

      applyFilters: async () => {
        await get().fetchCars(1);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "car-storage",
      partialize: (state) => ({
        filters: state.filters,
        availability: true,
        sort: state.sort,
      }),
    },
  ),
);

export default useCarStore;
