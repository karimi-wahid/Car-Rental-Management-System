import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!user) {
      checkAuth();
    }
  }, [checkAuth, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">
          {t("protectedRoute.checkingAccess")}
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (
    allowedRoles.length > 0 &&
    (!user?.role || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
