import { create } from "zustand";
import {
  createFeedbackService,
  getCarFeedbackService,
  getMyFeedbackService,
  updateFeedbackService,
  deleteFeedbackService,
  getAllFeedbackService,
  moderateFeedbackService,
  replyToFeedbackService,
  buildFeedbackQuery,
} from "@/services/feedbackService";

const useFeedbackStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────
  carFeedback: [], // feedback for a specific car page
  myFeedback: [], // current user's own reviews
  allFeedback: [], // admin: all feedback
  selectedFeedback: null,

  ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },

  loading: false,
  submitting: false, // separate flag for form submissions
  error: null,

  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },

  // ── USER ───────────────────────────────────────────────

  createFeedback: async (data) => {
    set({ submitting: true, error: null });
    try {
      const res = await createFeedbackService(data);
      const newFeedback = res.data.data.feedback;

      set((state) => ({
        carFeedback: [newFeedback, ...state.carFeedback],
        myFeedback: [newFeedback, ...state.myFeedback],
        submitting: false,
      }));

      return { success: true, data: newFeedback };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to submit review";
      set({ submitting: false, error });
      return { success: false, error };
    }
  },

  fetchCarFeedback: async (
    carId,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  ) => {
    set({ loading: true, error: null });
    try {
      const query = buildFeedbackQuery({ page, limit, sort });
      const res = await getCarFeedbackService(carId, query);
      const { feedback, ratingBreakdown, pagination } = res.data.data;

      set({
        carFeedback: feedback,
        ratingBreakdown,
        pagination,
        loading: false,
      });

      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load reviews",
        loading: false,
      });
      throw err;
    }
  },

  fetchMyFeedback: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getMyFeedbackService();
      set({ myFeedback: res.data.data.feedback, loading: false });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load your reviews",
        loading: false,
      });
      throw err;
    }
  },

  updateFeedback: async (id, data) => {
    set({ submitting: true, error: null });
    try {
      const res = await updateFeedbackService(id, data);
      const updated = res.data.data.feedback;

      set((state) => ({
        myFeedback: state.myFeedback.map((f) => (f._id === id ? updated : f)),
        carFeedback: state.carFeedback.map((f) => (f._id === id ? updated : f)),
        selectedFeedback: updated,
        submitting: false,
      }));

      return { success: true, data: updated };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to update review";
      set({ submitting: false, error });
      return { success: false, error };
    }
  },

  deleteFeedback: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteFeedbackService(id);

      set((state) => ({
        myFeedback: state.myFeedback.filter((f) => f._id !== id),
        carFeedback: state.carFeedback.filter((f) => f._id !== id),
        loading: false,
      }));

      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to delete review";
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  // ── ADMIN ──────────────────────────────────────────────

  fetchAllFeedback: async (page = 1, limit = 20, status = "") => {
    set({ loading: true, error: null });
    try {
      const query = buildFeedbackQuery({ page, limit, status });
      const res = await getAllFeedbackService(query);
      const { feedback, pagination } = res.data.data;

      set({ allFeedback: feedback, pagination, loading: false });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load feedback",
        loading: false,
      });
      throw err;
    }
  },

  moderateFeedback: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const res = await moderateFeedbackService(id, status);
      const updated = res.data.data.feedback;

      set((state) => ({
        allFeedback: state.allFeedback.map((f) => (f._id === id ? updated : f)),
        loading: false,
      }));

      return { success: true, data: updated };
    } catch (err) {
      const error =
        err.response?.data?.message || "Failed to moderate feedback";
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  replyToFeedback: async (id, reply) => {
    set({ submitting: true, error: null });
    try {
      const res = await replyToFeedbackService(id, reply);
      const updated = res.data.data.feedback;

      set((state) => ({
        allFeedback: state.allFeedback.map((f) => (f._id === id ? updated : f)),
        carFeedback: state.carFeedback.map((f) => (f._id === id ? updated : f)),
        submitting: false,
      }));

      return { success: true, data: updated };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to submit reply";
      set({ submitting: false, error });
      return { success: false, error };
    }
  },

  // ── UTILS ──────────────────────────────────────────────

  setSelectedFeedback: (feedback) => set({ selectedFeedback: feedback }),
  clearError: () => set({ error: null }),
  clearCarFeedback: () =>
    set({ carFeedback: [], ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }),
}));

export default useFeedbackStore;
