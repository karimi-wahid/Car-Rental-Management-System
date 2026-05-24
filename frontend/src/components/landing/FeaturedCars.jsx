import { useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpLeft, Fuel, Users, Gauge } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import useCarStore from "@/store/carStore";
import FavoriteButton from "@/components/cars/FavoriteButton";
import { useTranslation } from "react-i18next";

const FUEL_MAP = {
  petrol: "fuel.petrol",
  diesel: "fuel.diesel",
  electric: "fuel.electric",
  hybrid: "fuel.hybrid",
};

const TRANS_MAP = {
  automatic: "transmission.automatic",
  manual: "transmission.manual",
};

const MiniCarCard = ({ car, index, navigate, t, i18n }) => (
  <motion.article
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{
      duration: 0.55,
      delay: index * 0.1,
      ease: [0.23, 1, 0.32, 1],
    }}
    onClick={() => car.availability && navigate(`/cars/${car._id}`)}
    className="group relative cursor-pointer"
    dir={i18n.language === "en" ? "ltr" : "rtl"}
  >
    {/* Image */}
    <div className="relative overflow-hidden rounded-2xl mb-4 bg-zinc-100 dark:bg-zinc-800 aspect-4/3">
      <motion.img
        src={car.images?.[0]?.url || car.images?.[0] || "/placeholder-car.jpg"}
        alt={car.name}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

      {/* Pills */}
      <div className="absolute top-3 right-3 flex gap-1.5">
        <span className="bg-black/40 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
          {t(TRANS_MAP[car.transmission]) || car.transmission}
        </span>
      </div>

      {/* Favorite */}
      <div
        className="absolute top-3 left-3"
        onClick={(e) => e.stopPropagation()}
      >
        <FavoriteButton
          carId={car._id}
          classCode="bg-black/30 hover:bg-black/50 backdrop-blur border border-white/10 text-white w-7 h-7 rounded-full"
        />
      </div>

      {/* Price */}
      <div className="absolute bottom-3 right-3">
        <span className="text-white font-bold text-base drop-shadow-sm">
          {formatCurrency(car.pricePerDay)}
          <span className="text-white/60 text-xs font-normal">
            / {t("day")}
          </span>
        </span>
      </div>

      {/* Arrow on hover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1 }}
        className="absolute bottom-3 left-3"
      >
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
          <ArrowUpLeft className="w-4 h-4 text-zinc-900" />
        </div>
      </motion.div>
    </div>

    {/* Info */}
    <div className="px-1">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-white text-base leading-tight">
            {car.name}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {car.brand} · {car.carModel || car.model}
          </p>
        </div>
        {!car.availability && (
          <span className="text-[10px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
            {t("unavailable")}
          </span>
        )}
      </div>

      {/* Specs inline */}
      <div className="flex items-center gap-4 mt-2">
        {[
          { icon: Users, value: `${car.seats} ${t("person")}` },
          { icon: Fuel, value: t(FUEL_MAP[car.fuelType]) || car.fuelType },
          {
            icon: Gauge,
            value: car.mileage
              ? `${Number(car.mileage).toLocaleString(
                  i18n.language === "en" ? "en-US" : "fa-IR",
                )} km`
              : "—",
          },
        ].map(({ icon: Icon, value }) => (
          <div
            key={value}
            className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500"
          >
            <Icon className="w-3 h-3" />
            <span className="text-xs">{value}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.article>
);

const FeaturedCars = () => {
  const { fetchCars, cars, loading } = useCarStore();
  const navigate = useNavigate();
  const featured = cars.slice(0, 6);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  return (
    <section
      className="py-24 px-6 md:px-16 bg-white dark:bg-zinc-950"
      dir={i18n.language === "en" ? "ltr" : "rtl"}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs text-zinc-400 tracking-[0.2em] uppercase mb-3 flex items-center gap-3"
            >
              <span className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" />
              {t("featured.selection")}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {t("featured.title")}{" "}
            </motion.h2>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            onClick={() => navigate("/cars")}
            className="hidden md:flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group"
          >
            {t("featured.viewAll")}
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 aspect-4/3 mb-4" />
                <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded mb-2" />
                <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((car, i) => (
              <MiniCarCard
                key={car._id}
                car={car}
                index={i}
                navigate={navigate}
                t={t}
                i18n={i18n}
              />
            ))}
          </div>
        )}

        {/* Mobile view all */}
        <div className="mt-10 text-center md:hidden">
          <button
            onClick={() => navigate("/cars")}
            className="flex items-center gap-2 mx-auto text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            مشاهده همه موترها
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;
