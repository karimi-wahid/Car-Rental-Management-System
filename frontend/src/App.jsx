import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { PageLoader } from "@/components/Loader/PageLoader";
import { Toaster } from "react-hot-toast";

// Layouts
import PublicLayout from "@/components/Layouts/PublicLayout";
import UserLayout from "@/components/Layouts/UserLayout";
import AdminLayout from "@/components/Layouts/AdminLayout";

// Public
import ProtectedRoute from "@/components/common/ProtectedRoute";
import UnauthorizedPage from "@/pages/public/UnauthorizedPage";
const LandingPage = lazy(() => import("@/pages/public/LandingPage"));
const CarsPage = lazy(() => import("@/pages/public/CarsPage"));
const CarDetailsPage = lazy(() => import("@/pages/public/CarDetailsPage"));
const AboutPage = lazy(() => import("@/pages/public/AboutPage"));
const ContactPage = lazy(() => import("@/pages/public/ContactPage"));

// Auth Pages
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));
const VerifyEmailCallbackPage = lazy(
  () => import("@/pages/auth/VerifyEmailCallbackPage"),
);

// User pages
const UserDashboardPage = lazy(() => import("@/pages/user/UserDashboardPage"));
const MyBookingsPage = lazy(() => import("@/pages/user/MyBookingPage"));
const BookingHistoryPage = lazy(
  () => import("@/pages/user/BookingHistoryPage"),
);
const BookingDetailsPage = lazy(
  () => import("@/pages/user/BookingDetailsPage"),
);
const ProfilePage = lazy(() => import("@/pages/user/ProfilePage"));
const FavoritesPage = lazy(() => import("@/pages/user/FavoritesPage"));
const FeedbackPage = lazy(() => import("@/pages/user/FeedbackPage"));

// Admin pages
const AdminDashboardPage = lazy(
  () => import("@/pages/admin/AdminDashboardPage"),
);
const ManageCarsPage = lazy(() => import("@/pages/admin/ManageCarsPage"));
const ManageUsersPage = lazy(() => import("@/pages/admin/ManageUsersPage"));
const ManageBookingsPage = lazy(
  () => import("@/pages/admin/ManageBookingsPage"),
);
const ManageCommentsPage = lazy(
  () => import("@/pages/admin/ManageCommentsPage"),
);
const ManageContactsPage = lazy(
  () => import("@/pages/admin/ManageContactsPage"),
);
import "./i18n";

const App = () => {
  return (
    <Router>
      <Toaster />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Protected User Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/cars/:id" element={<CarDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route
              path="/verify-email/callback"
              element={<VerifyEmailCallbackPage />}
            />

            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Route>

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route
                path="/bookings/history"
                element={<BookingHistoryPage />}
              />
              <Route path="/bookings/:id" element={<BookingDetailsPage />} />
              <Route path="/settings" element={<ProfilePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/feedbacks" element={<FeedbackPage />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/cars" element={<ManageCarsPage />} />
              <Route path="/admin/users" element={<ManageUsersPage />} />
              <Route path="/admin/bookings" element={<ManageBookingsPage />} />
              <Route path="/admin/comments" element={<ManageCommentsPage />} />
              <Route path="/admin/contacts" element={<ManageContactsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
