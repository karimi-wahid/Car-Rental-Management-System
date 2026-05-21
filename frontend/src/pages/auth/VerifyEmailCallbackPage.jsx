import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Loader2 } from "lucide-react";

import { toast } from "react-hot-toast";

import { useTranslation } from "react-i18next";

import { useAuthStore } from "@/store/authStore";

const VerifyEmailCallback = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const { checkAuth } = useAuthStore();

  const { t, i18n } = useTranslation();

  useEffect(() => {
    const verified = searchParams.get("verified");

    const error = searchParams.get("error");

    if (error) {
      toast.error(t("auth.verify.callback.invalid"));

      navigate("/verify-email", {
        replace: true,
      });

      return;
    }

    const completeVerification = async () => {
      // Small delay to ensure cookie is fully set by the backend
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if user is now authenticated
      const isAuthenticated = await checkAuth();

      if (isAuthenticated) {
        toast.success(t("auth.verify.callback.success"));

        navigate("/dashboard", {
          replace: true,
        });
      } else if (verified === "true") {
        toast.success(t("auth.verify.callback.loginRequired"));

        navigate("/login", {
          replace: true,
        });
      } else {
        toast.error(t("auth.verify.callback.somethingWrong"));

        navigate("/login", {
          replace: true,
        });
      }
    };

    if (verified === "true") {
      completeVerification();
    } else {
      checkAuth().then((isAuthenticated) => {
        if (isAuthenticated) {
          navigate("/dashboard", {
            replace: true,
          });
        } else {
          navigate("/login", {
            replace: true,
          });
        }
      });
    }
  }, [navigate, searchParams, checkAuth, t]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      dir={i18n.language === "en" ? "ltr" : "rtl"}
    >
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />

        <p className="text-muted-foreground">
          {t("auth.verify.callback.loading")}
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailCallback;
