import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Users, Fuel, Gauge, Calendar, ArrowUpLeft, Zap } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import FavoriteButton from "./FavoriteButton";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export const CarCard = ({ car, index = 0 }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isRTL = i18n.language !== "en";

  const isElectric = car.fuelType === "electric";
  const isAvailable = car.availability;

  const getTransmissionText = () => {
    return t(`transmission.${car.transmission}`, car.transmission);
  };

  const getFuelTypeText = () => {
    return t(`fuel.${car.fuelType}`, car.fuelType);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        ease: [0.23, 1, 0.32, 1],
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      dir={isRTL ? "rtl" : "ltr"}
      className={cn(
        "relative group rounded-3xl overflow-hidden cursor-pointer select-none",
        "bg-white dark:bg-zinc-900",
        "border border-zinc-100 dark:border-zinc-800",
        "shadow-sm hover:shadow-2xl hover:shadow-zinc-200/60 dark:hover:shadow-zinc-900/60",
        "transition-shadow duration-500",
        !isAvailable && "opacity-75",
      )}
      onClick={() => isAvailable && navigate(`/cars/${car._id}`)}
      style={{ willChange: "transform" }}
    >
      {/* ── Image ───────────────────────────────── */}
      <div className="relative h-52 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {/* Skeleton shimmer while loading */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-linear-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 animate-pulse" />
        )}

        <motion.img
          src={
            car.images?.[0]?.url || car.images?.[0] || "/placeholder-car.jpg"
          }
          alt={car.name}
          onLoad={() => setImgLoaded(true)}
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-zinc-900/60 flex items-center justify-center">
            <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full">
              {t("carCard.unavailable")}
            </span>
          </div>
        )}

        {/* Top row: badges + favorite */}
        <div
          className={`absolute top-3.5 ${isRTL ? "right-3.5 left-3.5" : "left-3.5 right-3.5"} flex items-center justify-between`}
        >
          <div className="flex gap-1.5">
            {/* Transmission pill */}
            <span className="bg-black/40 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/10">
              {getTransmissionText()}
            </span>

            {/* Electric indicator */}
            {isElectric && (
              <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 fill-white" />
                {t("carCard.electric")}
              </span>
            )}
          </div>

          {/* Favorite */}
          <div onClick={(e) => e.stopPropagation()}>
            <FavoriteButton
              carId={car._id}
              classCode="bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 text-white w-8 h-8 rounded-full"
            />
          </div>
        </div>

        {/* Bottom: price */}
        <div
          className={`absolute bottom-3.5 ${isRTL ? "right-3.5" : "left-3.5"}`}
        >
          <div className="flex items-baseline gap-1">
            <span className="text-white font-bold text-xl leading-none drop-shadow-sm">
              {formatCurrency(car.pricePerDay)}
            </span>
            <span className="text-white/60 text-xs">{t("carCard.perDay")}</span>
          </div>
        </div>

        {/* Bottom: year */}
        <div
          className={`absolute bottom-3.5 ${isRTL ? "left-3.5" : "right-3.5"}`}
        >
          <span className="bg-black/30 backdrop-blur-md text-white/80 text-[11px] px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />
            {car.year}
          </span>
        </div>
      </div>

      {/* ── Content ─────────────────────────────── */}
      <div className="p-5">
        {/* Title row */}
        <div className={`mb-4 ${isRTL ? "text-right" : "text-left"}`}>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight line-clamp-1 mb-0.5">
            {car.name}
          </h3>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            {car.brand} · {car.carModel}
          </p>
        </div>

        {/* Specs row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            {
              icon: Users,
              value: t("carCard.seatsCount", { count: car.seats }),
              label: t("carCard.capacity"),
            },
            {
              icon: Fuel,
              value: getFuelTypeText(),
              label: t("carCard.fuel"),
            },
            {
              icon: Gauge,
              value: car.mileage ? formatNumber(Number(car.mileage)) : "—",
              label: t("carCard.mileage"),
            },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl py-3 px-2"
            >
              <Icon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-none">
                {value}
              </span>
              <span className="text-[10px] text-zinc-400 leading-none">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Features */}
        {car.features?.length > 0 && (
          <div
            className={`flex flex-wrap gap-1.5 mb-4 ${isRTL ? "justify-end" : "justify-start"}`}
          >
            {car.features.slice(0, 3).map((f, i) => {
              // Try to get localized feature name, fallback to original
              const featureKey = f.toLowerCase().replace(/\s+/g, "");
              const localizedFeature = t(
                `carCard.carFeatures.${featureKey}`,
                f,
              );
              return (
                <span
                  key={i}
                  className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full"
                >
                  {localizedFeature}
                </span>
              );
            })}
            {car.features.length > 3 && (
              <span className="text-[11px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                +{car.features.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!isAvailable}
          onClick={(e) => {
            e.stopPropagation();
            if (isAvailable) navigate(`/cars/${car._id}`);
          }}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200",
            isAvailable
              ? "bg-primary text-white hover:bg-zinc-700 dark:hover:bg-zinc-100"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed",
            isRTL ? "flex-row-reverse" : "",
          )}
        >
          <span>
            {isAvailable ? t("carCard.viewDetails") : t("carCard.notAvailable")}
          </span>
          {isAvailable && (
            <motion.span
              animate={{
                x: hovered ? (isRTL ? 3 : -3) : 0,
                y: hovered ? -3 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <ArrowUpLeft className="w-4 h-4" />
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Hover border accent */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none border-2 border-transparent"
        animate={{
          borderColor:
            hovered && isAvailable ? "rgba(0,0,0,0.08)" : "transparent",
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.article>
  );
};
