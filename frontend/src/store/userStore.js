import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  getMeService,
  updateMeService,
  deleteMeService,
  getAllUsersService,
  getUserService,
  createUserService,
  updateUserService,
  deleteUserService,
  updateUserRoleService,
} from "@/services/userService";
import useFavoriteStore from "./favoriteStore";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      users: [],
      loading: false,
      error: null,
      isAuthenticated: false,

      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },

      // ================= USER =================

      getMe: async () => {
        set({ loading: true, error: null });
        try {
          const res = await getMeService();

          set({
            user: res.data.data.user,
            isAuthenticated: true,
            loading: false,
          });

          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message,
            loading: false,
            isAuthenticated: false,
          });
          throw err;
        }
      },

      fetchUser: async (id) => {
        set({ loading: true, error: null });
        try {
          const res = await getUserService(id);
          set({ loading: false });
          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch user",
            loading: false,
          });
          throw err;
        }
      },

      updateMe: async (data) => {
        set({ loading: true, error: null });
        try {
          const res = await updateMeService(data);

          set({
            user: res.data.data.user,
            loading: false,
          });
          useFavoriteStore.getState().reset();

          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message,
            loading: false,
          });
          throw err;
        }
      },

      deleteMe: async () => {
        set({ loading: true, error: null });
        try {
          await deleteMeService();

          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });

          localStorage.removeItem("token");
        } catch (err) {
          set({
            error: err.response?.data?.message,
            loading: false,
          });
          throw err;
        }
      },

      // ================= ADMIN =================

      getAllUsers: async (page = 1, limit = 10) => {
        set({ loading: true, error: null });

        try {
          const res = await getAllUsersService(page, limit);

          set({
            users: res.data.data.users,
            pagination: {
              page: res.data.page || page,
              limit,
              total: res.data.total || 0,
              pages: res.data.pages || 1,
            },
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

      createUser: async (data) => {
        set({ loading: true, error: null });

        try {
          const res = await createUserService(data);
          const newUser = res.data.data.user;

          set((state) => ({
            users: [newUser, ...state.users],
            loading: false,
          }));

          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message,
            loading: false,
          });
          throw err;
        }
      },

      updateUser: async (id, data) => {
        set({ loading: true, error: null });

        try {
          const res = await updateUserService(id, data);
          const updatedUser = res.data.data.user;

          set((state) => ({
            users: state.users.map((u) => (u._id === id ? updatedUser : u)),
            loading: false,
          }));

          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message,
            loading: false,
          });
          throw err;
        }
      },

      deleteUser: async (id) => {
        set({ loading: true, error: null });

        try {
          await deleteUserService(id);

          set((state) => ({
            users: state.users.filter((u) => u._id !== id),
            loading: false,
          }));
        } catch (err) {
          set({
            error: err.response?.data?.message,
            loading: false,
          });
          throw err;
        }
      },

      updateUserRole: async (id, role) => {
        set({ loading: true, error: null });

        try {
          const res = await updateUserRoleService(id, { role });

          const updatedUser = res.data.data.user;

          set((state) => ({
            users: state.users.map((u) => (u._id === id ? updatedUser : u)),
            loading: false,
          }));

          return res.data;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to update role",
            loading: false,
          });
          throw err;
        }
      },

      // ================= UTILS =================

      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          users: [],
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({}),
    },
  ),
);

export default useUserStore;
