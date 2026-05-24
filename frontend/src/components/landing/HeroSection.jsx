import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="container-custom relative z-10">
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="flex justify-center mb-4">
            <Badge
              variant="secondary"
              className="px-4 py-3 text-sm bg-primary/10 text-primary border-primary/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />

              {t("hero.badge")}
            </Badge>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeInUp}
            className="text-xl md:text-3xl lg:text-5xl font-display font-bold tracking-tight"
          >
            <span>{t("hero.title1")}</span>

            <br />

            <span>{t("hero.title2")}</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            {t("hero.description")}
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="group text-lg px-8 py-6 cursor-pointer"
              onClick={() => navigate("/cars")}
            >
              {t("hero.viewCars")}

              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 hover:text-white hover:bg-[#b11226] transition-colors duration-300 cursor-pointer"
              onClick={() => navigate("/about")}
            >
              {t("hero.learnMore")}
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              {
                value: "500+",
                label: t("hero.stats.cars"),
                icon: Shield,
              },

              {
                value: "24/7",
                label: t("hero.stats.support"),
                icon: Clock,
              },

              {
                value: "98%",
                label: t("hero.stats.customers"),
                icon: Sparkles,
              },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-6 h-6" />
                </div>

                <div className="text-3xl font-bold">{stat.value}</div>

                <div className="text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
