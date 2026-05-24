import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Phone, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const CTASection = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <section
      className="relative py-20 md:py-32 overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-300"
      dir={i18n.language === "en" ? "ltr" : "rtl"}
    >
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-500/30 bg-white/70 dark:bg-slate-900/40 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-slate-700 dark:text-white">
                {t("cta.badge")}
              </span>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-10 md:mb-12"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              {t("cta.title1")}
              <span className="block text-primary">{t("cta.title2")}</span>
            </h2>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t("cta.description")}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14 md:mb-16"
          >
            <Button
              size="lg"
              className="group relative px-8 py-3 md:py-4 text-base md:text-lg font-semibold bg-primary text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
              onClick={() => navigate("/cars")}
            >
              <span className="flex items-center justify-center">
                {t("cta.viewCars")}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300 rtl:rotate-180" />
              </span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="px-8 py-3 md:py-4 text-base md:text-lg font-semibold border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-300"
              onClick={() => navigate("/contact")}
            >
              {t("cta.contactUs")}
            </Button>
          </motion.div>

          {/* Contact Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 pt-8 md:pt-12 border-t border-slate-200 dark:border-slate-700/50"
          >
            {/* Phone */}
            <motion.div
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <div className="p-3 rounded-lg dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="text-center">
                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {t("cta.phone")}
                </p>
                <p className="font-semibold">+93 766 303 465</p>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <div className="p-3 rounded-lg dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30">
                <Mail className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>

              <div className="text-center">
                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {t("cta.email")}
                </p>

                <p className="font-semibold text-sm md:text-base">
                  reservations@carrental.com
                </p>
              </div>
            </motion.div>

            {/* Booking */}
            <motion.div
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <div className="p-3 rounded-lg dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="text-center">
                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {t("cta.booking")}
                </p>

                <p className="font-semibold">{t("cta.online247")}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
