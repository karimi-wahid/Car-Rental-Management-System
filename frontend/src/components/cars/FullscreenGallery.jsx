import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion } from "motion/react";

const FullscreenGallery = ({ images, initial, onClose }) => {
  const { i18n } = useTranslation();

  const isRTL = i18n.language !== "en";
  const [current, setCurrent] = useState(initial);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Button
        className={cn(
          "absolute top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20",
          isRTL ? "right-5" : "left-5",
        )}
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </Button>

      <Button
        className={cn(
          "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20",
          isRTL ? "left-5" : "right-5",
        )}
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
      >
        {isRTL ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </Button>
      <button
        className="absolute left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
      >
        {isRTL ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>

      <motion.img
        key={current}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        src={images[current]?.url || images[current]}
        className="max-h-[85vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setCurrent(i);
            }}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === current ? "w-6 bg-white" : "w-2 bg-white/30",
            )}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default FullscreenGallery;
