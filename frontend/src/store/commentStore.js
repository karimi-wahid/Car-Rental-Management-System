import { create } from "zustand";
import {
  getCarCommentsService,
  getCommentRepliesService,
  createCommentService,
  updateCommentService,
  deleteCommentService,
  toggleLikeService,
  getMyCommentsService,
  getAllCommentsService,
  moderateCommentService,
  adminDeleteCommentService,
  replyToCommentService,
  buildCommentQuery,
} from "@/services/commentService";

const useCommentStore = create((set, get) => ({
  // ── State ──────────────────────────────────────
  carComments: [],
  myComments: [],
  allComments: [], // admin

  loading: false,
  submitting: false,
  error: null,

  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },

  // ── USER ───────────────────────────────────────

  fetchCarComments: async (carId, page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const query = buildCommentQuery({ page, limit });
      const res = await getCarCommentsService(carId, query);
      console.log(res);
      const { comments, pagination } = res.data.data;

      set({
        carComments:
          page === 1 ? comments : [...get().carComments, ...comments],
        pagination,
        loading: false,
      });

      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load comments",
        loading: false,
      });
      throw err;
    }
  },

  fetchMoreReplies: async (commentId, page = 2) => {
    try {
      const query = buildCommentQuery({ page, limit: 10 });
      const res = await getCommentRepliesService(commentId, query);
      const { replies } = res.data.data;

      // Merge new replies into the parent comment
      set((state) => ({
        carComments: state.carComments.map((c) =>
          c._id === commentId
            ? { ...c, replies: [...(c.replies || []), ...replies] }
            : c,
        ),
      }));

      return res.data;
    } catch (err) {
      const error = err.response?.data?.message || "Failed to post comment";
      console.log(error);
      throw err;
    }
  },

  createComment: async (carId, content, parentId = null) => {
    set({ submitting: true, error: null });
    try {
      const res = await createCommentService({ carId, content, parentId });
      const newComment = res.data.data.comment;

      set((state) => {
        if (parentId) {
          // Append reply to parent
          return {
            carComments: state.carComments.map((c) =>
              c._id === parentId
                ? { ...c, replies: [...(c.replies || []), newComment] }
                : c,
            ),
            submitting: false,
          };
        }
        // Prepend top-level comment
        return {
          carComments: [newComment, ...state.carComments],
          submitting: false,
        };
      });

      return { success: true, data: newComment };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to post comment";
      set({ submitting: false, error });
      return { success: false, error };
    }
  },

  updateComment: async (id, content, parentId = null) => {
    set({ submitting: true, error: null });
    try {
      const res = await updateCommentService(id, { content });
      const updated = res.data.data.comment;

      set((state) => {
        if (parentId) {
          return {
            carComments: state.carComments.map((c) =>
              c._id === parentId
                ? {
                    ...c,
                    replies: (c.replies || []).map((r) =>
                      r._id === id ? updated : r,
                    ),
                  }
                : c,
            ),
            submitting: false,
          };
        }
        return {
          carComments: state.carComments.map((c) =>
            c._id === id ? { ...c, ...updated } : c,
          ),
          submitting: false,
        };
      });

      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to update comment";
      set({ submitting: false, error });
      return { success: false, error };
    }
  },

  deleteComment: async (id, parentId = null) => {
    set({ loading: true, error: null });
    try {
      await deleteCommentService(id);

      set((state) => {
        if (parentId) {
          return {
            carComments: state.carComments.map((c) =>
              c._id === parentId
                ? {
                    ...c,
                    replies: (c.replies || []).filter((r) => r._id !== id),
                  }
                : c,
            ),
            loading: false,
          };
        }
        return {
          carComments: state.carComments.filter((c) => c._id !== id),
          loading: false,
        };
      });

      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to delete comment";
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  toggleLike: async (id, parentId = null) => {
    try {
      const res = await toggleLikeService(id);
      const { liked, likeCount } = res.data.data;

      const updateLike = (comment) =>
        comment._id === id ? { ...comment, likeCount, liked } : comment;

      set((state) => {
        if (parentId) {
          return {
            carComments: state.carComments.map((c) =>
              c._id === parentId
                ? { ...c, replies: (c.replies || []).map(updateLike) }
                : c,
            ),
          };
        }
        return { carComments: state.carComments.map(updateLike) };
      });
    } catch (err) {
      const error = err.response?.data?.message || "Failed to post comment";
      console.log(error);
      throw err;
    }
  },

  fetchMyComments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getMyCommentsService();
      set({ myComments: res.data.data.comments, loading: false });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load your comments",
        loading: false,
      });
      throw err;
    }
  },

  // ── ADMIN ──────────────────────────────────────

  fetchAllComments: async (page = 1, limit = 20, status = "") => {
    set({ loading: true, error: null });
    try {
      const query = buildCommentQuery({ page, limit, status });
      const res = await getAllCommentsService(query);
      const { comments, pagination } = res.data.data;

      set({ allComments: comments, pagination, loading: false });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load comments",
        loading: false,
      });
      throw err;
    }
  },

  moderateComment: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const res = await moderateCommentService(id, status);
      const updated = res.data.data.comment;

      set((state) => ({
        allComments: state.allComments.map((c) => (c._id === id ? updated : c)),
        loading: false,
      }));

      return { success: true, data: updated };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to moderate comment";
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  adminDeleteComment: async (id) => {
    set({ loading: true, error: null });
    try {
      await adminDeleteCommentService(id);

      set((state) => ({
        allComments: state.allComments.filter((c) => c._id !== id),
        loading: false,
      }));

      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to delete comment";
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  replyToComment: async (id, reply) => {
    set({ submitting: true, error: null });
    try {
      const res = await replyToCommentService(id, reply);
      const updated = res.data.data.comment;

      set((state) => ({
        allComments: state.allComments.map((c) => (c._id === id ? updated : c)),
        carComments: state.carComments.map((c) =>
          c._id === id ? { ...c, adminReply: updated.adminReply } : c,
        ),
        submitting: false,
      }));

      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || "Failed to send reply";
      set({ submitting: false, error });
      return { success: false, error };
    }
  },

  // ── UTILS ──────────────────────────────────────
  clearCarComments: () => set({ carComments: [] }),
  clearError: () => set({ error: null }),
}));

export default useCommentStore;
