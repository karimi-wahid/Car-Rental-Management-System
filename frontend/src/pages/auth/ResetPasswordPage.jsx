import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { motion } from "motion/react";

import {
  Eye,
  EyeOff,
  Lock,
  Loader2,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "@/store/authStore";

import { cn } from "@/lib/utils";
import { calculatePasswordStrength } from "@/utils/passwordStrength";

// Zod Schema
const resetPasswordSchema = (t) =>
  z
    .object({
      password: z
        .string()
        .min(8, t("auth.reset.validation.passwordMin"))
        .regex(/[a-z]/, t("auth.reset.validation.lowercase"))
        .regex(/[A-Z]/, t("auth.reset.validation.uppercase"))
        .regex(/[0-9]/, t("auth.reset.validation.number"))
        .regex(/[@$!%*?&#]/, t("auth.reset.validation.special")),

      passwordConfirm: z
        .string()
        .min(1, t("auth.reset.validation.confirmRequired")),
    })

    .refine((data) => data.password === data.passwordConfirm, {
      message: t("auth.reset.validation.passwordMismatch"),

      path: ["passwordConfirm"],
    });

const ResetPasswordPage = () => {
  const { token } = useParams();

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  // Auth Store
  const resetPassword = useAuthStore((state) => state.resetPassword);

  const isLoading = useAuthStore((state) => state.isLoading);

  const error = useAuthStore((state) => state.error);

  const clearError = useAuthStore((state) => state.clearError);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // States
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  const [tokenError, setTokenError] = useState(null);

  // React Hook Form + Zod
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema(t)),

    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const password = watch("password", "");

  // Clear Errors
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect
  useEffect(() => {
    if (isAuthenticated && isSuccess) {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [isAuthenticated, isSuccess, navigate]);

  // Password Strength
  const passwordStrength = calculatePasswordStrength(password);

  const getStrengthColor = (strength) => {
    if (strength < 50) return "bg-destructive";

    if (strength < 75) return "bg-yellow-500";

    return "bg-green-500";
  };

  const getStrengthText = (strength) => {
    if (strength < 50) return t("auth.reset.strength.weak");

    if (strength < 75) return t("auth.reset.strength.medium");

    return t("auth.reset.strength.strong");
  };

  // Submit
  const onSubmit = async (data) => {
    if (!token) {
      setTokenError(t("auth.reset.invalidLink"));

      return;
    }

    setTokenError(null);

    const result = await resetPassword(
      token,
      data.password,
      data.passwordConfirm,
    );

    if (result.success) {
      setIsSuccess(true);
    }

    if (result.tokenExpired) {
      setTokenError(true);
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
              {t("auth.reset.successTitle")}
            </h1>

            <p className="mb-6 text-muted-foreground">
              {t("auth.reset.successDescription")}
            </p>

            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Invalid Token
  if (tokenError || (error && tokenError && !isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
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
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>

            <h1 className="mb-4 text-2xl font-bold">
              {t("auth.reset.invalidTitle")}
            </h1>

            <p className="mb-6 text-muted-foreground">
              {t("auth.reset.invalidDescription")}
            </p>

            <div className="space-y-3">
              <Link to="/forgot-password">
                <Button className="w-full">
                  {t("auth.reset.requestNewLink")}
                </Button>
              </Link>

              <Link to="/login">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />

                  {t("auth.reset.backToLogin")}
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

            {t("auth.reset.backToLogin")}
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-bold">{t("auth.reset.title")}</h1>

            <p className="text-muted-foreground">{t("auth.reset.subtitle")}</p>
          </div>

          {/* Server Error */}
          {error && !tokenError && (
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
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور جدید</Label>

              <div className="relative">
                <Lock
                  className={cn(
                    "absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground",
                    isRTL ? "right-3" : "left-3",
                  )}
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn("px-10", isRTL ? "text-right" : "text-left")}
                  autoComplete="new-password"
                  autoFocus
                  disabled={isLoading}
                  {...register("password")}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                    isRTL ? "left-3" : "right-3",
                  )}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {errors.password && (
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
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">
                {t("auth.reset.confirmPassword")}
              </Label>

              <div className="relative">
                <Lock
                  className={cn(
                    "absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground",
                    isRTL ? "right-3" : "left-3",
                  )}
                />

                <Input
                  id="passwordConfirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn("px-10", isRTL ? "text-right" : "text-left")}
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...register("passwordConfirm")}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                    isRTL ? "left-3" : "right-3",
                  )}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {errors.passwordConfirm && (
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
                  {errors.passwordConfirm.message}
                </motion.p>
              )}

              {/* Strength */}
              {password && (
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  className="mt-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("auth.reset.passwordStrength")}
                    </span>

                    <span
                      className={cn(
                        "font-medium",

                        passwordStrength < 50 && "text-destructive",

                        passwordStrength >= 50 &&
                          passwordStrength < 75 &&
                          "text-yellow-500",

                        passwordStrength >= 75 && "text-green-500",
                      )}
                    >
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>

                  <Progress
                    value={passwordStrength}
                    className={cn("h-2", getStrengthColor(passwordStrength))}
                  />
                </motion.div>
              )}

              {/* Requirements */}
              <div className="mt-2 space-y-1">
                <p className="mb-2 text-xs text-muted-foreground">
                  {t("auth.reset.requirementsTitle")}
                </p>

                <div className="grid grid-cols-2 gap-1">
                  {[
                    {
                      regex: /.{8,}/,
                      text: t("auth.reset.requirements.min"),
                    },
                    {
                      regex: /[a-z]/,
                      text: t("auth.reset.requirements.lowercase"),
                    },
                    {
                      regex: /[A-Z]/,
                      text: t("auth.reset.requirements.uppercase"),
                    },
                    {
                      regex: /[0-9]/,
                      text: t("auth.reset.requirements.number"),
                    },
                    {
                      regex: /[@$!%*?&#]/,
                      text: t("auth.reset.requirements.special"),
                    },
                  ].map((req, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <span
                        className={cn(
                          "ml-1",

                          req.regex.test(password)
                            ? "text-green-500"
                            : "text-muted-foreground",
                        )}
                      >
                        {req.regex.test(password) ? "✓" : "○"}
                      </span>

                      <span
                        className={cn(
                          req.regex.test(password)
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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

                  {t("auth.reset.loading")}
                </>
              ) : (
                t("auth.reset.submit")
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
