import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import logo from "@/assets/logo.svg";
import { useTranslation } from "react-i18next";

export const AuthLayout = ({ children, title, subtitle }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  const features = [
    t("authLayout.feature1"),
    t("authLayout.feature2"),
    t("authLayout.feature3"),
    t("authLayout.feature4"),
  ];

  return (
    <div className="min-h-screen flex" dir={isRTL ? "rtl" : "ltr"}>
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center ${isRTL ? "space-x-reverse" : "space-x-2"} mb-8`}
          >
            <img src={logo} alt="logo" />
          </Link>

          {/* Header */}
          <div className={`mb-8 ${isRTL ? "text-right" : "text-left"}`}>
            <h1 className="text-3xl font-display font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {/* Form */}
          {children}
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-primary/70 to-primary relative overflow-hidden">
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-white p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-white/80" />
            <h2 className="text-3xl font-display font-bold mb-4">
              {t("authLayout.premiumTitle")}
            </h2>
            <p className="text-lg text-white/80 max-w-md">
              {t("authLayout.premiumDescription")}
            </p>

            {/* Features List */}
            <div
              className={`mt-8 space-y-4 ${isRTL ? "text-right" : "text-left"}`}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center"
                >
                  <span className="text-white/90">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
