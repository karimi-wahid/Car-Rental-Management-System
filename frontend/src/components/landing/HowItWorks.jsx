import { motion } from "motion/react";
import {
  Search,
  Calendar,
  Key,
  Car,
  CheckCircle,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
  const { t, i18n } = useTranslation();

  const steps = [
    {
      icon: Search,
      title: t("howItWorks.steps.browse.title"),
      description: t("howItWorks.steps.browse.description"),
      number: 1,
    },

    {
      icon: Calendar,
      title: t("howItWorks.steps.dates.title"),
      description: t("howItWorks.steps.dates.description"),
      number: 2,
    },

    {
      icon: CreditCard,
      title: t("howItWorks.steps.booking.title"),
      description: t("howItWorks.steps.booking.description"),
      number: 3,
    },

    {
      icon: Key,
      title: t("howItWorks.steps.drive.title"),
      description: t("howItWorks.steps.drive.description"),
      number: 4,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      className="relative py-20 md:py-32  overflow-hidden"
      dir={i18n.language === "en" ? "ltr" : "rtl"}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6"
          >
            <Badge
              variant="outline"
              className="px-4 py-2 border-acdcent/40 bg-accent/5 hover:bg-accent/10 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-2" />
              {t("howItWorks.badge")}
            </Badge>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            <span>{t("howItWorks.title")}</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("howItWorks.description")}
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4"
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants} className="group">
              <div className="relative h-full">
                {/* Step Card */}
                <div className="relative h-full p-8 rounded-2xl border border-border hover:border-accent/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-accent/10">
                  {/* Number Badge */}
                  <div className="absolute -top-5 right-8 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center shadow-lg shadow-accent/30">
                      {step.number}
                    </div>
                  </div>

                  {/* Icon Container */}
                  <div className="mb-8 pt-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-linear-to-br from-accent/20 to-accent/10 group-hover:from-accent/30 group-hover:to-accent/20 transition-all"
                    >
                      <step.icon className="w-8 h-8 text-accent" />
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 text-foreground leading-snug">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  {/* Connection Arrow (hidden on mobile) */}
                  {index < steps.length - 1 && (
                    <motion.div
                      className="hidden lg:flex absolute -right-3 top-1/2 transform -translate-y-1/2 z-20"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-accent/40 bg-background flex items-center justify-center group-hover:border-accent/60 transition-colors">
                        <ArrowRight className="w-3 h-3 text-accent/60" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-linear-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
