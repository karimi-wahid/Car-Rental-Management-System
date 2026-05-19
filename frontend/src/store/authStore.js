import { create } from "zustand";
import {
  signupService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  updatePasswordService,
  logoutService,
  getMeService,
  verifyEmailService,
  verifyOTPService,
  resendVerificationService,
} from "@/services/authService";
import useFavoriteStore from "@/store/favoriteStore";

const authStore = (set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await signupService(userData);
      // ✅ No longer returns a user — just a message
      set({ isLoading: false, error: null });

      return { success: true, message: res.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed";
      set({ isLoading: false, error: errorMessage, isAuthenticated: false });
      return { success: false, error: errorMessage };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await loginService(email, password);
      const { data } = res.data;

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  verifyEmail: async (token) => {
    set({ isLoading: true, error: null });

    try {
      const res = await verifyEmailService(token);

      const { data } = res.data;

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true, message: res.data.message };
    } catch (err) {
      const message =
        err.response?.data?.message || "Email verification failed";

      set({ isLoading: false, error: message });

      return { success: false, error: message };
    }
  },

  verifyOTP: async (email, otp) => {
    set({ isLoading: true, error: null });

    try {
      const res = await verifyOTPService({ email, otp });

      const { data } = res.data;

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Invalid or expired OTP";

      set({ isLoading: false, error: message });

      return { success: false, error: message };
    }
  },

  resendVerification: async (email) => {
    set({ isLoading: true, error: null });

    try {
      const res = await resendVerificationService({ email });

      set({ isLoading: false });

      return { success: true, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to resend email";

      set({ isLoading: false, error: message });

      return { success: false, error: message };
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await forgotPasswordService(email);
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to send reset email";
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  resetPassword: async (token, password, passwordConfirm) => {
    set({ isLoading: true, error: null });
    try {
      const res = await resetPasswordService(token, {
        password,
        passwordConfirm,
      });

      const { data } = res.data;

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || "Failed to reset password";

      set({
        isLoading: false,
        error: message,
        tokenExpired: status === 400,
      });

      return { success: false, error: message };
    }
  },

  updatePassword: async (passwordCurrent, password, passwordConfirm) => {
    set({ isLoading: true, error: null });
    try {
      const res = await updatePasswordService({
        passwordCurrent,
        password,
        passwordConfirm,
      });

      const { data } = res.data;

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update password";
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await logoutService();
    } finally {
      set({ user: null, isAuthenticated: false });
      useFavoriteStore.getState().reset(); // clear favorites on logout
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await getMeService();
      const { data } = res.data;

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null, tokenExpired: false }),
});

export const useAuthStore = create(authStore);
