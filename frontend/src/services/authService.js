import { axiosInstance } from "./api";

// Signup
export const signupService = (userData) =>
  axiosInstance.post("/auth/signup", userData);

// Login
export const loginService = (email, password) =>
  axiosInstance.post("/auth/login", { email, password });

// Verify via EMAIL LINK
export const verifyEmailService = (token) =>
  axiosInstance.get(`/auth/verify-email/${token}`);

// Verify via OTP
export const verifyOTPService = (data) =>
  axiosInstance.post("/auth/verify-otp", data);

// Resend verification (OTP + link)
export const resendVerificationService = (data) =>
  axiosInstance.post("/auth/resend-verification", data);

// Forgot Password
export const forgotPasswordService = (email) =>
  axiosInstance.post("/auth/forgotPassword", { email });

// Reset Password
export const resetPasswordService = (token, data) =>
  axiosInstance.patch(`/auth/resetPassword/${token}`, data);

// Update Password
export const updatePasswordService = (data) =>
  axiosInstance.patch("/auth/updateMyPassword", data);

// Logout
export const logoutService = () => axiosInstance.post("/auth/logout");

// Check Auth
export const getMeService = () => axiosInstance.get("/users/me");
