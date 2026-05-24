import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import PublicLayout from "./components/Layouts/PublicLayout";
import LandingPage from "./pages/public/LandingPage";
import CarsPage from "./pages/public/CarsPage";
import CarDetailsPage from "./pages/public/CarDetailsPage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import VerifyEmailCallbackPage from "./pages/auth/VerifyEmailCallbackPage";
import UnauthorizedPage from "./pages/public/UnauthorizedPage";
import { PageLoader } from "./components/loader/PageLoader";
import "./i18n";

const App = () => {
  return (
    <Router>
      <Toaster />
      <Suspense fallback={<PageLoader />}>
        <Routes>
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
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
