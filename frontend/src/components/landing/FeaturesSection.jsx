import { motion, useInView } from "motion/react";
import { useRef } from "react";
import {
  Shield,
  Clock,
  CreditCard,
  MapPin,
  Headphones,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { t, i18n } = useTranslation();

  const features = [
    {
      icon: Shield,
      title: t("features.items.protection.title"),
      description: t("features.items.protection.description"),
      num: "01",
    },

    {
      icon: Clock,
      title: t("features.items.support24.title"),
      description: t("features.items.support24.description"),
      num: "02",
    },

    {
      icon: CreditCard,
      title: t("features.items.payment.title"),
      description: t("features.items.payment.description"),
      num: "03",
    },

    {
      icon: MapPin,
      title: t("features.items.delivery.title"),
      description: t("features.items.delivery.description"),
      num: "04",
    },

    {
      icon: Headphones,
      title: t("features.items.concierge.title"),
      description: t("features.items.concierge.description"),
      num: "05",
    },

    {
      icon: Star,
      title: t("features.items.premium.title"),
      description: t("features.items.premium.description"),
      num: "06",
    },
  ];

  return (
    <section
      className="py-24 px-6 md:px-16 bg-white dark:bg-zinc-950 overflow-hidden transition-colors duration-300"
      dir={i18n.language === "en" ? "ltr" : "rtl"}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="text-xs text-zinc-500 dark:text-zinc-500 tracking-[0.25em] uppercase mb-4 flex items-center gap-3"
            >
              <span className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" />
              {t("features.whyChooseUs")}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white leading-[1.05] tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {t("features.title1")}
              <br />
              {t("features.title2")}
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-zinc-600 dark:text-zinc-400 text-sm max-w-xs leading-relaxed md:text-right"
          >
            {t("features.description")}
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-2xl overflow-hidden">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
              className="group relative bg-white dark:bg-zinc-950 p-8 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-300"
            >
              {/* Number watermark */}
              <span
                className={`absolute top-6 ${i18n.language === "en" ? "right-6" : "left-6"} text-6xl font-black text-zinc-100 dark:text-zinc-900 select-none transition-colors duration-300 group-hover:text-zinc-200 dark:group-hover:text-zinc-800`}
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {f.num}
              </span>

              {/* Icon */}
              <div className="relative z-10 mb-6">
                <div className="w-12 h-12 border border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-500 transition-colors duration-300 flex items-center justify-center rounded-lg bg-zinc-50 dark:bg-transparent">
                  <f.icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-300" />
                </div>
              </div>

              {/* Text */}
              <h3 className="relative z-10 text-lg font-bold text-zinc-900 dark:text-white mb-3">
                {f.title}
              </h3>

              <p className="relative z-10 text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed group-hover:text-zinc-700 dark:group-hover:text-zinc-400 transition-colors duration-300">
                {f.description}
              </p>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 right-0 h-px w-0 bg-zinc-900/20 dark:bg-white/20 group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
