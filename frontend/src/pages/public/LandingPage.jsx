import CTASection from "../../components/landing/CTASection";
import FeaturedCars from "../../components/landing/FeaturedCars";
import FeaturesSection from "../../components/landing/FeaturesSection";
import HeroSection from "../../components/landing/HeroSection";
import HowItWorks from "../../components/landing/HowItWorks";
import { motion } from "motion/react";

const LandingPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="overflow-hidden"
    >
      <HeroSection />
      <FeaturedCars />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
    </motion.div>
  );
};

export default LandingPage;
