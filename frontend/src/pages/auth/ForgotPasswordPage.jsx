import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { motion } from "motion/react";

import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

import { useAuthStore } from "@/store/authStore";

// Zod Schema
const forgotPasswordSchema = (t) =>
  z.object({
    email: z
      .string()
      .min(1, t("auth.forgot.validation.emailRequired"))
      .email(t("auth.forgot.validation.emailInvalid")),
  });

const ForgotPasswordPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";
  const [submittedEmail, setSubmittedEmail] = useState("");
  // Auth Store
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  // React Hook Form + Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema(t)),

    defaultValues: {
      email: "",
    },
  });

  // Clear Errors
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Submit
  const onSubmit = async (data) => {
    const result = await forgotPassword(data.email);

    if (result.success) {
      setSubmittedEmail(data.email);

      setIsSuccess(true);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={cn(
          "flex min-h-screen items-center justify-center p-4",
          isRTL ? "text-right" : "text-left",
        )}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="mb-4 text-2xl font-bold">
              {t("auth.forgot.successTitle")}
            </h1>

            <p className="mb-6 text-muted-foreground">
              {t("auth.forgot.successDescription")}{" "}
              <span className="font-medium text-foreground">
                {submittedEmail}
              </span>
            </p>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("auth.forgot.noEmail")}
              </p>

              <Button
                variant="outline"
                onClick={() => setIsSuccess(false)}
                className="w-full"
              >
                {t("auth.forgot.tryAgain")}
              </Button>

              <Link to="/login">
                <Button variant="ghost" className="w-full gap-2">
                  <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />

                  {t("auth.forgot.backToLogin")}
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Back */}
          <Link
            to="/login"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft
              className={cn("h-4 w-4", isRTL ? "ml-2 rotate-180" : "mr-2")}
            />

            {t("auth.forgot.backToLogin")}
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-bold">
              {t("auth.forgot.title")}
            </h1>

            <p className="text-muted-foreground">{t("auth.forgot.subtitle")}</p>
          </div>

          {/* Server Error */}
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />

                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.forgot.email")}</Label>

              <div className="relative">
                <Mail
                  className={cn(
                    "absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground",
                    isRTL ? "right-3" : "left-3",
                  )}
                />

                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.forgot.emailPlaceholder")}
                  className={cn(isRTL ? "pr-10 text-right" : "pl-10 text-left")}
                  autoComplete="email"
                  autoFocus
                  disabled={isLoading}
                  {...register("email")}
                />
              </div>

              {errors.email && (
                <motion.p
                  initial={{
                    opacity: 0,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="text-sm text-destructive"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2
                    className={cn(
                      "h-4 w-4 animate-spin",
                      isRTL ? "ml-2" : "mr-2",
                    )}
                  />

                  {t("auth.forgot.loading")}
                </>
              ) : (
                t("auth.forgot.submit")
              )}
            </Button>

            {/* Login */}
            <p className="text-center text-sm text-muted-foreground">
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                {t("auth.forgot.rememberPassword")}
              </Link>
            </p>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
