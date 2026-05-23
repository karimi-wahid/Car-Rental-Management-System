import { useState } from "react";
import FullscreenGallery from "./FullscreenGallery";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const ImageStrip = ({ images, carName }) => {
  const [gallery, setGallery] = useState(null);
  const main = images?.[0]?.url || images?.[0] || "/placeholder-car.jpg";
  const thumbs = images?.slice(1, 5) || [];

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-105 md:h-130">
        {/* Main large image */}
        <div
          className="col-span-3 row-span-2 relative overflow-hidden rounded-2xl cursor-zoom-in"
          onClick={() => setGallery(0)}
        >
          <motion.img
            src={main}
            alt={carName}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
        </div>

        {/* Thumbnails */}
        {[0, 1, 2, 3].map((i) => {
          const src = thumbs[i]?.url || thumbs[i];
          return (
            <div
              key={i}
              className={cn(
                "relative overflow-hidden rounded-xl cursor-pointer",
                i === 3 && images.length > 5 ? "relative" : "",
              )}
              onClick={() => src && setGallery(i + 1)}
            >
              {src ? (
                <>
                  <motion.img
                    src={src}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover"
                  />
                  {i === 3 && images.length > 5 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        +{images.length - 4}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800" />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {gallery !== null && (
          <FullscreenGallery
            images={images}
            initial={gallery}
            onClose={() => setGallery(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageStrip;
