import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const ImageGallery = ({ images, carName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-video rounded-2xl overflow-hidden group">
          <motion.img
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            src={images[currentIndex].url}
            alt={`${carName} - View ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={prevImage}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={nextImage}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setShowLightbox(true)}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={cn(
                "relative aspect-4/3 rounded-lg overflow-hidden transition-all duration-200",
                index === currentIndex
                  ? "ring-2 ring-primary scale-105"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <img
                src={image.url}
                alt={`${carName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95">
          <div className="relative h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setShowLightbox(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-50 text-white hover:bg-white/20"
              onClick={prevImage}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-50 text-white hover:bg-white/20"
              onClick={nextImage}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                src={images[currentIndex].url}
                alt={`${carName} - Fullscreen ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </AnimatePresence>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
