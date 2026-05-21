import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { calculatePasswordStrength } from "@/utils/passwordStrength";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const registerSchema = (t) =>
  z
    .object({
      name: z
        .string()
        .min(1, t("auth.register.validation.nameRequired"))
        .min(2, t("auth.register.validation.nameMin"))
        .max(50, t("auth.register.validation.nameMax")),
      email: z
        .string()
        .min(1, t("auth.register.validation.emailRequired"))
        .email(t("auth.register.validation.emailInvalid")),
      password: z
        .string()
        .min(1, t("auth.register.validation.passwordRequired"))
        .min(8, t("auth.register.validation.passwordMin"))
        .refine((v) => calculatePasswordStrength(v) >= 50, {
          message: t("auth.register.validation.passwordWeak"),
        }),
      passwordConfirm: z
        .string()
        .min(1, t("auth.register.validation.confirmRequired")),
    })
    .refine((d) => d.password === d.passwordConfirm, {
      message: t("auth.register.validation.passwordMismatch"),
      path: ["passwordConfirm"],
    });

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dir = i18n.language === "en" ? "ltr" : "rtl";
  const isRTL = dir === "rtl";

  const signup = useAuthStore((s) => s.signup);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema(t)),
    defaultValues: { name: "", email: "", password: "", passwordConfirm: "" },
  });

  const password = watch("password", "");

  useEffect(() => {
    clearError();
    setServerError("");
  }, [clearError]);
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const passwordStrength = calculatePasswordStrength(password);

  const getStrengthColor = (s) =>
    s < 50 ? "bg-destructive" : s < 75 ? "bg-yellow-500" : "bg-green-500";
  const getStrengthText = (s) =>
    s < 50
      ? t("auth.register.strength.weak")
      : s < 75
        ? t("auth.register.strength.medium")
        : t("auth.register.strength.strong");

  const onSubmit = async (data) => {
    setServerError("");
    const result = await signup({
      name: data.name,
      email: data.email,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
    });
    if (result.success) {
      localStorage.setItem("pendingVerificationEmail", data.email);
      toast.success(t("auth.register.toast.verifyEmail"));
      navigate("/verify-email");
    } else {
      setServerError(result.error);
    }
  };

  const passwordRequirements = [
    { regex: /.{8,}/, text: t("auth.register.requirements.min") },
    { regex: /[a-z]/, text: t("auth.register.requirements.lowercase") },
    { regex: /[A-Z]/, text: t("auth.register.requirements.uppercase") },
    { regex: /[0-9]/, text: t("auth.register.requirements.number") },
    { regex: /[@$!%*?&]/, text: t("auth.register.requirements.special") },
  ];

  // Icon position helpers — flip for RTL
  const iconStart = isRTL ? "right-3" : "left-3";
  const iconEnd = isRTL ? "left-3" : "right-3";
  const inputPadStart = isRTL ? "pr-10" : "pl-10";
  const inputPadBoth = isRTL ? "pr-10 pl-10" : "pl-10 pr-10";

  return (
    <AuthLayout
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir={dir}>
        {/* Server Error */}
        {(serverError || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-center text-sm text-destructive"
          >
            {serverError || error}
          </motion.div>
        )}

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">{t("auth.register.fullName")}</Label>
          <div className="relative">
            <User
              className={cn(
                "absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground",
                iconStart,
              )}
            />
            <Input
              id="name"
              type="text"
              placeholder={t("auth.register.fullNamePlaceholder")}
              className={inputPadStart}
              autoComplete="name"
              disabled={isSubmitting || isLoading}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive"
            >
              {errors.name.message}
            </motion.p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.register.email")}</Label>
          <div className="relative">
            <Mail
              className={cn(
                "absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground",
                iconStart,
              )}
            />
            <Input
              id="email"
              type="email"
              placeholder={t("auth.register.emailPlaceholder")}
              className={inputPadStart}
              autoComplete="email"
              disabled={isSubmitting || isLoading}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive"
            >
              {errors.email.message}
            </motion.p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.register.password")}</Label>
          <div className="relative">
            <Lock
              className={cn(
                "absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground",
                iconStart,
              )}
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={inputPadBoth}
              autoComplete="new-password"
              disabled={isSubmitting || isLoading}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground",
                iconEnd,
              )}
              aria-label={
                showPassword
                  ? t("auth.register.hidePassword")
                  : t("auth.register.showPassword")
              }
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive"
            >
              {errors.password.message}
            </motion.p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">
            {t("auth.register.confirmPassword")}
          </Label>
          <div className="relative">
            <Lock
              className={cn(
                "absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground",
                iconStart,
              )}
            />
            <Input
              id="passwordConfirm"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className={inputPadBoth}
              autoComplete="new-password"
              disabled={isSubmitting || isLoading}
              {...register("passwordConfirm")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground",
                iconEnd,
              )}
              aria-label={
                showConfirmPassword
                  ? t("auth.register.hidePassword")
                  : t("auth.register.showPassword")
              }
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive"
            >
              {errors.passwordConfirm.message}
            </motion.p>
          )}

          {/* Password Strength */}
          {password && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("auth.register.passwordStrength")}
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
          <div className="mt-2 space-y-2">
            <p className="mb-2 text-sm text-muted-foreground">
              {t("auth.register.requirementsTitle")}
            </p>
            {passwordRequirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {req.regex.test(password) ? (
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
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

        {/* Terms */}
        <div className="text-center text-sm text-muted-foreground">
          {t("auth.register.termsText")}{" "}
          <Link to="/terms" className="text-primary hover:underline">
            {t("auth.register.terms")}
          </Link>{" "}
          {t("auth.register.and")}{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            {t("auth.register.privacy")}
          </Link>{" "}
          {t("auth.register.agreeText")}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("auth.register.creatingAccount")}
            </>
          ) : (
            t("auth.register.createAccount")
          )}
        </Button>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          {t("auth.register.alreadyHaveAccount")}{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            {t("auth.register.login")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
