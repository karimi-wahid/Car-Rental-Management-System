import useFeedbackStore from "@/store/feedbackStore";
import { useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import StarDisplay from "./StarDisplay";
import { Button } from "../ui/button";
import { Edit2, MessageSquare, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import FeedbackForm from "./FeedbackForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { formatDate, getInitials } from "@/lib/utils";

const ReviewCard = ({ feedback, currentUserId }) => {
  const { t, i18n } = useTranslation();
  const { deleteFeedback } = useFeedbackStore();
  const [editing, setEditing] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const isOwner = feedback.user?._id === currentUserId;
  const isRTL = i18n.language !== "en";

  const handleDelete = async () => {
    const result = await deleteFeedback(deleteId);
    if (result.success) toast.success(t("reviewCard.deleteSuccess"));
    else toast.error(result.error || t("reviewCard.deleteError"));
    setDeleteId(null);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="py-6 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
      >
        <div
          className={`flex items-start justify-between gap-4 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <div
            className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Avatar className="w-9 h-9">
              <AvatarImage src={feedback.user?.avatar} />
              <AvatarFallback className="text-xs bg-zinc-200 dark:bg-zinc-700">
                {getInitials(feedback.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="font-medium text-sm text-zinc-900 dark:text-white">
                {feedback.user?.name || t("reviewCard.anonymous")}
              </p>
              <p className="text-xs text-zinc-400">
                {formatDate(feedback.createdAt)}
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <StarDisplay value={feedback.rating} />
            {isOwner && (
              <div className={`flex gap-1 ${isRTL ? "mr-2" : "ml-2"}`}>
                {feedback.status !== "approved" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditing(!editing)}
                    aria-label={t("reviewCard.editReview")}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(feedback._id)}
                  aria-label={t("reviewCard.deleteReview")}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {feedback.title && (
          <p
            className={`font-semibold text-zinc-900 dark:text-white mb-1 ${isRTL ? "text-right" : "text-left"}`}
          >
            {feedback.title}
          </p>
        )}

        <p
          className={`text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
        >
          {feedback.comment}
        </p>

        {feedback.isVerifiedPurchase && (
          <Badge
            variant="outline"
            className={`mt-3 text-xs text-emerald-600 border-emerald-200 ${isRTL ? "mr-0" : ""}`}
          >
            ✓ {t("reviewCard.verifiedBooking")}
          </Badge>
        )}

        {feedback.adminReply && (
          <div
            className={`mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl ${isRTL ? "text-right" : "text-left"}`}
          >
            <p
              className={`text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1 ${isRTL ? "justify-end flex-row-reverse" : ""}`}
            >
              <MessageSquare className="w-3 h-3" />
              {t("reviewCard.ownerResponse")}
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {feedback.adminReply}
            </p>
          </div>
        )}

        <AnimatePresence>
          {editing && (
            <div className="mt-4">
              <FeedbackForm
                existing={feedback}
                onClose={() => setEditing(false)}
              />
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={isRTL ? "text-right" : "text-left"}>
              {t("reviewCard.deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("reviewCard.deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter
            className={isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""}
          >
            <AlertDialogCancel>
              {t("reviewCard.common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className={`bg-destructive hover:bg-destructive/90 ${isRTL ? "mr-2 sm:mr-0 sm:ml-2" : ""}`}
            >
              {t("reviewCard.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReviewCard;
