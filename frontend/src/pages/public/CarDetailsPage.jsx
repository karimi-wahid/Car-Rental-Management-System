import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Share2,
  Clock,
  Star,
  Loader2,
  CheckCircle,
  Fuel,
  Gauge,
  Users,
  Calendar,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookingCalendar } from "@/components/cars/BookingCalendar";
import { CarSpecs } from "@/components/cars/CarSpecs";
import { toast } from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import useCarStore from "@/store/carStore";
import useBookingStore from "@/store/bookingStore";
import FavoriteButton from "@/components/cars/FavoriteButton";
import { CarReviews } from "@/components/cars/CarReviews";
import { CarComments } from "@/components/cars/CarComments";
import { cn } from "@/lib/utils";
import ImageStrip from "@/components/cars/ImageStrip";
import SpecPill from "@/components/cars/SpecPill";
import TabBtn from "@/components/cars/TabBtn";

// ── Main Page ──────────────────────────────────────────────────
const CarDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const TRANS_MAP = {
    automatic: t("car.transmission.automatic"),
    manual: t("car.transmission.manual"),
  };

  const FUEL_MAP = {
    petrol: t("fuel.petrol"),
    diesel: t("fuel.diesel"),
    electric: t("fuel.electric"),
    hybrid: t("fuel.hybrid"),
  };

  const isRTL = i18n.language !== "en";
  const { isAuthenticated } = useAuthStore();
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("specs");
  const [completedBookingId, setCompletedBookingId] = useState(null);

  const { selectedCar: car, loading, fetchCarById } = useCarStore();
  const { createBooking, userBookings, fetchUserBookings, error } =
    useBookingStore();

  useEffect(() => {
    if (id) {
      fetchCarById(id);
      if (isAuthenticated) fetchUserBookings({ page: 1, limit: 50 });
    }
    console.log(car);
  }, [id]);

  useEffect(() => {
    if (!userBookings?.length || !id) return;
    const completed = userBookings.find(
      (b) => b.car?._id === id && b.status === "completed",
    );
    setCompletedBookingId(completed?._id || null);
  }, [userBookings, id]);

  const handleBooking = async (startDate, endDate) => {
    if (!isAuthenticated) {
      toast.error(t("cars.loginToBook"));
      navigate("/login", { state: { from: `/cars/${id}` } });
      return;
    }
    setBookingLoading(true);
    try {
      await createBooking({
        carId: id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      toast.success(t("cars.bookingSuccess"));
      navigate("/bookings");
    } catch {
      toast.error(error || t("cars.bookingFailed"));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: car?.name, url: window.location.href });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("cars.linkCopied"));
    }
  };

  // ── Loading ──
  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400 tracking-widest uppercase">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );

  // ── Not found ──
  if (!car)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center">
          <p className="text-zinc-400 mb-6 text-sm">{t("cars.notFound")}</p>
          <Button onClick={() => navigate("/cars")} variant="outline">
            {t("cars.backToCars")}
          </Button>
        </div>
      </div>
    );

  const specs = [
    {
      icon: Users,
      label: t("car.specs.capacity"),
      value: `${car.seats} ${t("cars.person")}`,
    },
    {
      icon: Fuel,
      label: t("car.specs.fuel"),
      value: FUEL_MAP[car.fuelType]?.[i18n.language] || car.fuelType,
    },
    {
      icon: Gauge,
      label: t("car.specs.mileage"),
      value: car.mileage
        ? Number(car.mileage).toLocaleString(
            i18n.language === "en" ? "en-US" : "fa-IR",
          )
        : "—",
    },
    { icon: Calendar, label: t("car.specs.year"), value: car.year },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-zinc-950 min-h-screen"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ── Sticky top bar ─────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            {isRTL ? (
              <ArrowRight className="h-4 w-4" />
            ) : (
              <ArrowLeft className="h-4 w-4" />
            )}

            {t("car.common.back")}
          </button>

          <div className="hidden md:block text-sm font-medium text-zinc-900 dark:text-white truncate max-w-xs">
            {car.name}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <FavoriteButton carId={car._id} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* ── Hero section ───────────────────────────── */}
        <div className="mb-10">
          {/* Title above gallery */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {car.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-zinc-400 mt-1.5 text-base"
              >
                {car.brand} · {car.carModel} · {car.year}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-left"
            >
              <p
                className="text-4xl font-black text-zinc-900 dark:text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {formatCurrency(car.pricePerDay)}
              </p>
              <p className="text-xs text-zinc-400 mt-1 tracking-widest uppercase">
                {t("car.perDay")}
              </p>
            </motion.div>
          </div>

          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ImageStrip images={car.images} carName={car.name} />
          </motion.div>
        </div>

        {/* ── Two column layout ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Left/Main column ──────────────────────── */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick specs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-4 gap-3"
            >
              {specs.map((s) => (
                <SpecPill key={s.label} {...s} />
              ))}
            </motion.div>

            {/* Status pills */}
            <div className="flex flex-wrap gap-2">
              {car.availability ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {t("car.availableForBooking")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                  {t("car.notAvailable")}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                {t("car.instantConfirmation")}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t("car.fullInsurance")}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-full">
                {TRANS_MAP[car.transmission] || car.transmission}
              </span>
            </div>

            <Separator />

            {/* Tab nav */}
            <div className="flex gap-8 border-b border-zinc-100 dark:border-zinc-800">
              {[
                { id: "specs", label: t("car.tabs.specs") },
                { id: "features", label: t("car.tabs.features") },
                { id: "policy", label: t("car.tabs.policy") },
              ].map((t) => (
                <TabBtn
                  key={t.id}
                  active={activeTab === t.id}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </TabBtn>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "specs" && <CarSpecs car={car} />}

                {activeTab === "features" && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {car.features?.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white shrink-0" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "policy" && (
                  <div className="space-y-3">
                    {[
                      {
                        icon: ShieldCheck,
                        text: t("car.policy.validLicense"),
                      },
                      {
                        icon: Users,
                        text: t("car.policy.minimumAge"),
                      },
                      {
                        icon: MapPin,
                        text: t("car.policy.freeDelivery"),
                      },
                      {
                        icon: Clock,
                        text: t("car.policy.freeCancellation"),
                      },
                      {
                        icon: Gauge,
                        text: t("car.policy.unlimitedMileage"),
                      },
                      {
                        icon: Star,
                        text: t("car.policy.support"),
                      },
                    ].map(({ icon: Icon, text }, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <Separator />

            {/* Reviews + Comments */}
            <CarReviews carId={car._id} bookingId={completedBookingId} />
            <CarComments carId={car._id} />
          </div>

          {/* ── Booking widget column ──────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm"
              >
                {/* Price header */}
                <div className="bg-zinc-950 dark:bg-zinc-900 p-5 flex items-baseline justify-between">
                  <div>
                    <span
                      className="text-2xl font-black text-white"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {formatCurrency(car.pricePerDay)}
                    </span>
                    <span className="text-zinc-500 text-sm mr-2">
                      / {t("car.day")}
                    </span>
                  </div>
                  {car.averageRating > 0 && (
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="text-sm font-medium text-white">
                        {car.averageRating}
                      </span>
                      {car.numRatings > 0 && (
                        <span className="text-xs text-zinc-500">
                          ({car.numRatings})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Calendar widget */}
                <div className="bg-white dark:bg-zinc-950 p-1">
                  <BookingCalendar
                    pricePerDay={car.pricePerDay}
                    carId={car._id}
                    onBookingSubmit={handleBooking}
                    disabled={!car.availability || bookingLoading}
                  />
                </div>
              </motion.div>

              {/* Trust signals */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  {
                    icon: ShieldCheck,
                    text: t("car.fullInsurance"),
                  },
                  {
                    icon: Clock,
                    text: t("car.instantConfirmation"),
                  },
                  {
                    icon: MapPin,
                    text: t("car.delivery"),
                  },
                  {
                    icon: Star,
                    text: t("car.support247"),
                  },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
                  >
                    <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CarDetailsPage;
