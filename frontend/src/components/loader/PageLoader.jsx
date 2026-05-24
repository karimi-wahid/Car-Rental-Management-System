import { motion } from "motion/react";
import { LoaderPinwheel } from "lucide-react";
import { useTranslation } from "react-i18next";

export const PageLoader = ({ text }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  // Use provided text prop or fallback to translation
  const loadingText = text || t("pageLoader.loading");

  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center"
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="mb-6"
        >
          <LoaderPinwheel className="w-16 h-16 text-primary my-2" />
        </motion.div>

        <h2 className="text-2xl font-display font-bold mb-2 gradient-text">
          CarRental
        </h2>

        <p className="text-muted-foreground">{loadingText}</p>

        <div
          className={`mt-4 flex justify-center ${isRTL ? "space-x-reverse" : ""} space-x-2`}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            className="w-2 h-2 bg-primary rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 bg-primary rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 bg-primary rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
};
