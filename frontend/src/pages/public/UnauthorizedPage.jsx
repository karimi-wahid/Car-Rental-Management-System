import { useLocation, useNavigate } from "react-router-dom";

import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

import { motion } from "motion/react";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const { t, i18n } = useTranslation();

  const {
    requiredRoles = [],
    userRole = "",
    redirectPath = "/",
  } = location.state || {};

  const getRoleDisplay = (role) => {
    const roles = {
      admin: t("auth.unauthorized.roles.admin"),
      user: t("auth.unauthorized.roles.user"),
    };

    return roles[role] || role;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      dir={i18n.language === "en" ? "ltr" : "rtl"}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="max-w-md w-full"
      >
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>

          <h1 className="text-2xl font-display font-bold mb-4">
            {t("auth.unauthorized.title")}
          </h1>

          <p className="text-muted-foreground mb-6">
            {t("auth.unauthorized.description")}
          </p>

          {requiredRoles.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm mb-2">
                {t("auth.unauthorized.yourRole")}{" "}
                <span className="font-medium">{getRoleDisplay(userRole)}</span>
              </p>

              <p className="text-sm">
                {t("auth.unauthorized.allowedRoles")}{" "}
                <span className="font-medium">
                  {requiredRoles
                    .map(getRoleDisplay)
                    .join(i18n.language === "en" ? ", " : "، ")}
                </span>
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate(redirectPath)} className="w-full">
              <Home
                className={`h-4 w-4 ${
                  i18n.language === "en" ? "mr-2" : "ml-2"
                }`}
              />

              {t("auth.unauthorized.goDashboard")}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full"
            >
              <ArrowLeft
                className={`h-4 w-4 ${
                  i18n.language === "en" ? "mr-2" : "ml-2"
                }`}
              />

              {t("auth.unauthorized.goBack")}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
