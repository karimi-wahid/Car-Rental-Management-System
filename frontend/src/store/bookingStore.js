import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  createBookingService,
  getUserBookingsService,
  getBookingByIdService,
  updateBookingService,
  cancelBookingService,
  checkAvailabilityService,
  getTimeSlotsService,
  getAllBookingsService,
  updateBookingStatusService,
  getBookingStatsService,
  buildBookingQuery,
  getUserBookingsHistoryService,
} from "@/services/bookingService";

const useBookingStore = create(
  persist(
    (set, get) => ({
      bookings: [],
      userBookings: [],
      selectedBooking: null,

      loading: false,
      error: null,

      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      },

      filters: {
        status: "",
        startDate: null,
        endDate: null,
        minPrice: "",
        maxPrice: "",
        carId: "",
      },

      sort: "-createdAt",

      // ================= USER =================

      createBooking: async (data) => {
        set({ loading: true, error: null });

        try {
          const res = await createBookingService(data);

          set((state) => ({
            userBookings: [
              res.data.data.booking,
              ...(state.userBookings || []),
            ],
            selectedBooking: res.data.data.booking,
            loading: false,
          }));

          return res.data.data;
        } catch (err) {
          set({ error: err.response?.data?.message, loading: false });
          throw err;
        }
      },

      fetchUserBookings: async ({ status = "", page = 1, limit = 10 } = {}) => {
        set({ loading: true, error: null });
        try {
          const { filters, sort } = get();

          const query = buildBookingQuery({
            page,
            limit,
            sort,
            ...filters,
            status,
          });

          const res = await getUserBookingsService(query);

          // ✅ flat shape from the new lean endpoint
          set({
            userBookings: res.data.data.bookings,
            pagination: res.data.data.pagination,
            loading: false,
          });

          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch bookings",
            loading: false,
          });
          throw err;
        }
      },

      fetchUserHistoryBookings: async ({
        status = "",
        page = 1,
        limit = 10,
      } = {}) => {
        set({ loading: true, error: null });

        try {
          const { filters, sort } = get();

          const query = buildBookingQuery({
            page,
            limit,
            sort,
            ...filters,
            status,
          });

          const res = await getUserBookingsHistoryService(query);

          set({
            userBookings: res.data.data.currentBookings,
            pagination: res.data.data.pagination,
            loading: false,
          });

          return res.data;
        } catch (err) {
          set({ error: err.response?.data?.message, loading: false });
          throw err;
        }
      },

      fetchBookingById: async (id) => {
        set({ loading: true, error: null });

        try {
          console.log("From Store", id);
          const res = await getBookingByIdService(id);
          console.log("Fetched booking details:", res);

          set({
            selectedBooking: res.data.data.booking,
            loading: false,
          });

          return res.data;
        } catch (err) {
          set({ error: err.response?.data?.message, loading: false });
          console.log("Error from Store", err);
          throw err;
        }
      },

      updateBooking: async (id, data) => {
        set({ loading: true, error: null });

        try {
          const res = await updateBookingService(id, data);
          const updated = res.data.data.booking;

          set((state) => ({
            userBookings: state.userBookings.map((b) =>
              b._id === id ? updated : b,
            ),
            selectedBooking: updated,
            loading: false,
          }));

          return res.data;
        } catch (err) {
          set({ error: err.response?.data?.message, loading: false });
          throw err;
        }
      },

      cancelBooking: async (id, reason) => {
        set({ loading: true, error: null });

        try {
          const res = await cancelBookingService(id, {
            cancellationReason: reason,
          });

          const updated = res.data.data.booking;

          set((state) => ({
            userBookings: state.userBookings.map((b) =>
              b._id === id ? updated : b,
            ),
            selectedBooking: updated,
            loading: false,
          }));

          return res.data;
        } catch (err) {
          set({ error: err.response?.data?.message, loading: false });
          throw err;
        }
      },

      checkAvailability: async (carId, startDate, endDate) => {
        set({ loading: true, error: null });
        try {
          const query = buildBookingQuery({ carId, startDate, endDate });
          const res = await checkAvailabilityService(query);
          set({ loading: false });
          return res.data;
        } catch (err) {
          set({
            error:
              err.response?.data?.message || "Failed to check availability",
            loading: false,
          });
          throw err;
        }
      },

      getTimeSlots: async (carId, date, duration = 1) => {
        set({ loading: true, error: null });
        try {
          const query = buildBookingQuery({ carId, date, duration });
          const res = await getTimeSlotsService(query);
          return res.data;
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to check getTimeSlots",
            loading: false,
          });
          throw error;
        }
      },

      // ================= ADMIN =================

      fetchAllBookings: async (page = 1, limit = 20) => {
        set({ loading: true, error: null });

        try {
          const { filters, sort } = get();

          const query = buildBookingQuery({
            page,
            limit,
            sort,
            ...filters,
          });

          const res = await getAllBookingsService(query);

          set({
            bookings: res.data.data.bookings,
            pagination: res.data.data.pagination, // ✅ FIXED
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

      updateBookingStatus: async (id, status, adminNotes = "") => {
        set({ loading: true, error: null });

        try {
          const res = await updateBookingStatusService(id, {
            status,
            adminNotes,
          });
          console.log(res);

          const updated = res.data.data.booking;

          set((state) => ({
            bookings: state.bookings.map((b) => (b._id === id ? updated : b)),
            userBookings: state.userBookings.map((b) =>
              b._id === id ? updated : b,
            ),
            selectedBooking: updated,
            loading: false,
          }));

          return res.data;
        } catch (err) {
          console.log(err.response?.data?.message);
          set({ error: err.response?.data?.message, loading: false });
          throw err;
        }
      },

      fetchBookingStatistics: async (
        period = "month",
        startDate = null,
        endDate = null,
      ) => {
        set({ loading: true, error: null });
        try {
          const query = buildBookingQuery({ period, startDate, endDate });
          const res = await getBookingStatsService(query);
          set({ loading: false });
          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch statistics",
            loading: false,
          });
          throw err;
        }
      },

      // ================= UTILS =================

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      clearFilters: () =>
        set({
          filters: {
            status: "",
            startDate: null,
            endDate: null,
            minPrice: "",
            maxPrice: "",
            carId: "",
          },
        }),

      setSort: (sort) => set({ sort }),

      applyFilters: async () => {
        const { pagination } = get();
        await get().fetchUserBookings({
          page: pagination.currentPage,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "booking-storage",
      partialize: (state) => ({
        filters: {
          ...state.filters,
          startDate: null,
          endDate: null,
        },
        sort: state.sort,
      }),
    },
  ),
);

export default useBookingStore;
