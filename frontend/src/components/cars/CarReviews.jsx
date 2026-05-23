import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import useFeedbackStore from "@/store/feedbackStore";
import { cn } from "@/lib/utils";
import FeedbackForm from "./FeedbackForm";
import StarDisplay from "./StarDisplay";
import RatingBar from "./RatingBar";
import ReviewCard from "./ReviewCard";
import { useTranslation } from "react-i18next";

export const CarReviews = ({ carId, bookingId }) => {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const {
    carFeedback,
    ratingBreakdown,
    pagination,
    loading,
    fetchCarFeedback,
    clearCarFeedback,
  } = useFeedbackStore();

  const [showForm, setShowForm] = useState(false);
  const [sort, setSort] = useState("-createdAt");
  const isRTL = i18n.language !== "en";

  useEffect(() => {
    fetchCarFeedback(carId, 1, 10, sort);
    return () => clearCarFeedback();
  }, [carId, sort]);

  const totalReviews = Object.values(ratingBreakdown).reduce(
    (a, b) => a + b,
    0,
  );
  const avgRating =
    totalReviews > 0
      ? Object.entries(ratingBreakdown).reduce(
          (sum, [star, count]) => sum + Number(star) * count,
          0,
        ) / totalReviews
      : 0;

  const canReview = !!bookingId && !!user;
  const alreadyReviewed = carFeedback.some((f) => f.user?._id === user?._id);

  const sortOptions = [
    { label: t("carReviews.newest"), value: "-createdAt" },
    { label: t("carReviews.highestRated"), value: "-rating" },
    { label: t("carReviews.lowestRated"), value: "rating" },
  ];

  return (
    <section className="mt-12">
      {/* Header */}
      <div
        className={`flex items-center justify-between mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {t("carReviews.reviews")}
        </h2>
        {canReview && !alreadyReviewed && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Star className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            {t("carReviews.writeReview")}
          </Button>
        )}
      </div>

      {/* Write review form */}
      <AnimatePresence>
        {showForm && (
          <div className="mb-8">
            <FeedbackForm
              carId={carId}
              bookingId={bookingId}
              onClose={() => setShowForm(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          {/* Average */}
          <div
            className={`flex items-center gap-6 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`text-center ${isRTL ? "text-right" : "text-left"}`}
            >
              <p className="text-6xl font-bold text-zinc-900 dark:text-white leading-none">
                {avgRating.toFixed(1)}
              </p>
              <StarDisplay value={Math.round(avgRating)} size={5} />
              <p className="text-sm text-zinc-400 mt-1">
                {t("carReviews.reviewCount", { count: totalReviews })}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar
                key={star}
                label={star}
                count={ratingBreakdown[star]}
                total={totalReviews}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sort */}
      {carFeedback.length > 0 && (
        <div className={`flex gap-2 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm transition-colors border",
                sort === opt.value
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="py-6 border-b border-zinc-100 dark:border-zinc-800 animate-pulse"
            >
              <div
                className={`flex gap-3 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : carFeedback.length === 0 ? (
        <div className="text-center py-16">
          <Star className="w-12 h-12 text-zinc-200 dark:text-zinc-700 mx-auto mb-4" />
          <p className="font-semibold text-zinc-900 dark:text-white mb-1">
            {t("carReviews.noReviews")}
          </p>
          <p className="text-sm text-zinc-400">
            {canReview
              ? t("carReviews.beFirstToReview")
              : t("carReviews.reviewsAfterBooking")}
          </p>
        </div>
      ) : (
        <AnimatePresence>
          {carFeedback.map((feedback) => (
            <ReviewCard
              key={feedback._id}
              feedback={feedback}
              currentUserId={user?._id}
            />
          ))}
        </AnimatePresence>
      )}

      {/* Load More */}
      {pagination.currentPage < pagination.totalPages && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() =>
              fetchCarFeedback(carId, pagination.currentPage + 1, 10, sort)
            }
            disabled={loading}
          >
            <ChevronDown className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            {t("carReviews.loadMore")}
          </Button>
        </div>
      )}
    </section>
  );
};
