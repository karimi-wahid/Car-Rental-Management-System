import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, useAnimation } from "motion/react";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendVerification } = useAuthStore();
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language !== "en";
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);

  const [email, setEmail] = useState(
    () => location.state?.email || localStorage.getItem("email") || "",
  );

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const controls = useAnimation();

  // ===============================
  // EMAIL LINK VERIFICATION
  // ===============================
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage(
          email
            ? t("auth.verify.enterOtp")
            : t("auth.verify.noVerificationMethod"),
        );
        return;
      }

      try {
        const response = await useAuthStore.getState().verifyEmail(token);

        if (response.success) {
          setStatus("success");
          setMessage(t("auth.verify.successMessage"));
          toast.success(t("auth.verify.toastSuccess"));
          localStorage.removeItem("email");
          setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        setStatus("error");
        setMessage(error.message || t("auth.verify.failed"));
        toast.error(t("auth.verify.failed"));

        const storedEmail = localStorage.getItem("email") || "";
        if (storedEmail) {
          setEmail(storedEmail);
          toast(t("auth.verify.useOtp"), {
            icon: "📧",
          });
        }
      }
    };

    verifyEmail();
  }, [token, navigate, email]);

  // ===============================
  // COUNTDOWN TIMER
  // ===============================
  useEffect(() => {
    if (countdown === 0) return;
    const timer = setTimeout(() => setCountdown((p) => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ===============================
  // OTP HANDLERS
  // ===============================
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      handleVerifyOTP(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = ["", "", "", "", "", ""];
    digits.forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    const lastIndex = digits.length - 1;
    if (lastIndex >= 0) {
      document.getElementById(`otp-${lastIndex}`)?.focus();
    }

    if (digits.length === 6) {
      handleVerifyOTP(digits.join(""));
    }
  };

  // ===============================
  // SHAKE ANIMATION (RTL compatible)
  // ===============================
  const shakeAnimation = async () => {
    await controls.start({
      x: [0, 10, -10, 10, -10, 0],
      transition: { duration: 0.4 },
    });
  };

  // ===============================
  // VERIFY OTP
  // ===============================
  const handleVerifyOTP = async (otpCode) => {
    if (!email) {
      toast.error(t("auth.verify.emailNotFound"));
      return;
    }

    setVerifyingOTP(true);
    try {
      const result = await verifyOTP(email, otpCode);

      if (result.success) {
        setStatus("success");
        setMessage(t("auth.verify.successMessage"));

        toast.success(t("auth.verify.toastSuccess"));
        localStorage.removeItem("pendingVerificationEmail");
        setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message || t("auth.verify.invalidOtp"));
      await shakeAnimation();
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setVerifyingOTP(false);
    }
  };

  // ===============================
  // RESEND
  // ===============================
  const handleResendVerification = async () => {
    if (countdown > 0 || !email) return;

    setResending(true);
    try {
      const result = await resendVerification(email);

      if (result.success) {
        toast.success(t("auth.verify.resendSuccess"));
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message || t("auth.verify.resendFailed"));
    } finally {
      setResending(false);
    }
  };

  const handleSendToEmail = async () => {
    if (!email) return toast.error(t("auth.verify.enterEmail"));

    setResending(true);
    try {
      const result = await resendVerification(email);

      if (result.success) {
        toast.success(t("auth.verify.resendSuccess"));
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error(t("auth.verify.sendFailed"));
    } finally {
      setResending(false);
    }
  };

  // Auto-focus first OTP input when email becomes available
  useEffect(() => {
    if (status === "error" && email) {
      setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
    }
  }, [status, email]);

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4",
        isRTL ? "text-right" : "text-left",
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="p-8 text-center">
          {/* LOADING */}
          {status === "loading" && (
            <>
              <Loader2 className="w-10 h-10 mx-auto animate-spin mb-4 text-primary" />

              <h2 className="text-xl font-bold">
                {t("auth.verify.loadingTitle")}
              </h2>

              <p className="text-muted-foreground mt-2">
                {t("auth.verify.loadingSubtitle")}
              </p>
            </>
          )}

          {/* SUCCESS */}
          {status === "success" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-xl font-bold mb-2">
                {t("auth.verify.successTitle")}
              </h2>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("auth.verify.redirecting")}
              </p>
              <Button
                className="mt-4 w-full"
                onClick={() => navigate("/dashboard", { replace: true })}
              >
                {t("auth.verify.goDashboard")}
              </Button>
            </>
          )}

          {/* ERROR */}
          {status === "error" && (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">
                {t("auth.verify.failedTitle")}
              </h2>
              <p className="mb-6 text-muted-foreground text-sm">{message}</p>

              {email ? (
                /* ── OTP FORM ── */
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("auth.verify.enterCode")}{" "}
                    <span
                      className="font-medium text-foreground"
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      {email}
                    </span>
                    {t("auth.verify.enterCodeSuffix")}
                  </p>

                  <motion.div
                    animate={controls}
                    className="flex justify-center gap-2 mb-4"
                    style={{ direction: isRTL ? "rtl" : "ltr" }}
                  >
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        disabled={verifyingOTP}
                        className="text-center"
                      />
                    ))}
                  </motion.div>

                  <Button
                    className="w-full mb-3"
                    onClick={() => handleVerifyOTP(otp.join(""))}
                    disabled={verifyingOTP || otp.some((d) => !d)}
                  >
                    {verifyingOTP ? (
                      <>
                        <Loader2
                          className={cn(
                            "w-4 h-4 animate-spin",
                            isRTL ? "ml-2" : "mr-2",
                          )}
                        />

                        {t("auth.verify.verifying")}
                      </>
                    ) : (
                      t("auth.verify.verifyCode")
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResendVerification}
                    disabled={resending || countdown > 0}
                  >
                    {resending ? (
                      <Loader2
                        className={cn(
                          "w-4 h-4 animate-spin",
                          isRTL ? "ml-2" : "mr-2",
                        )}
                      />
                    ) : (
                      <RefreshCw
                        className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")}
                      />
                    )}

                    {countdown > 0
                      ? t("auth.verify.resendCountdown", {
                          seconds: countdown,
                        })
                      : t("auth.verify.resendCode")}
                  </Button>
                </>
              ) : (
                /* ── NO EMAIL — ask for it and resend ── */
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("auth.verify.enterEmailDescription")}
                  </p>

                  <Input
                    type="email"
                    placeholder={t("auth.verify.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir={isRTL ? "rtl" : "ltr"}
                  />

                  <Button
                    className="w-full mb-3"
                    onClick={handleSendToEmail}
                    disabled={resending || !email}
                  >
                    {resending ? (
                      <>
                        <Loader2
                          className={cn(
                            "w-4 h-4 animate-spin",
                            isRTL ? "ml-2" : "mr-2",
                          )}
                        />

                        {t("auth.verify.sending")}
                      </>
                    ) : (
                      t("auth.verify.sendCode")
                    )}
                  </Button>

                  <Link to="/register">
                    <Button variant="ghost" className="w-full text-sm">
                      {t("auth.verify.noAccount")}
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
