import useFeedbackStore from "@/store/feedbackStore";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import StarInput from "./StarInput";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";

const FeedbackForm = ({ carId, bookingId, existing, onClose }) => {
  const { t, i18n } = useTranslation();
  const { createFeedback, updateFeedback, submitting } = useFeedbackStore();
  const [rating, setRating] = useState(existing?.rating || 0);
  const [title, setTitle] = useState(existing?.title || "");
  const [comment, setComment] = useState(existing?.comment || "");
  const isRTL = i18n.language !== "en";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t("feedbackForm.ratingRequired"));
      return;
    }
    if (!comment.trim()) {
      toast.error(t("feedbackForm.commentRequired"));
      return;
    }

    const result = existing
      ? await updateFeedback(existing._id, { rating, title, comment })
      : await createFeedback({ carId, bookingId, rating, title, comment });

    if (result.success) {
      toast.success(
        existing
          ? t("feedbackForm.updateSuccess")
          : t("feedbackForm.createSuccess"),
      );
      onClose?.();
    } else {
      toast.error(result.error || t("feedbackForm.errorMessage"));
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      onSubmit={handleSubmit}
      className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4"
    >
      <h3
        className={`font-semibold text-zinc-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}
      >
        {existing
          ? t("feedbackForm.editReview")
          : t("feedbackForm.writeReview")}
      </h3>

      <div>
        <p
          className={`text-sm text-zinc-500 mb-2 ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("feedbackForm.yourRating")}
        </p>
        <StarInput value={rating} onChange={setRating} size={7} />
      </div>

      <Input
        placeholder={t("feedbackForm.titlePlaceholder")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
        className={`bg-white dark:bg-zinc-800 ${isRTL ? "text-right" : "text-left"}`}
      />

      <Textarea
        placeholder={t("feedbackForm.commentPlaceholder")}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={4}
        className={`bg-white dark:bg-zinc-800 resize-none ${isRTL ? "text-right" : "text-left"}`}
      />

      <div
        className={`flex gap-3 ${isRTL ? "justify-start flex-row-reverse" : "justify-start"}`}
      >
        {onClose && (
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("feedbackForm.common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            t("feedbackForm.common.submitting")
          ) : (
            <>
              <Send className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {existing
                ? t("feedbackForm.editReview")
                : t("feedbackForm.submitReview")}
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
};

export default FeedbackForm;
