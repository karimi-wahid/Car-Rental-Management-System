import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "@/store/authStore";
import useCommentStore from "@/store/commentStore";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";

export const CarComments = ({ carId }) => {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    carComments,
    pagination,
    loading,
    fetchCarComments,
    clearCarComments,
  } = useCommentStore();
  const isRTL = i18n.language !== "en";

  useEffect(() => {
    fetchCarComments(carId, 1);
    return () => clearCarComments();
  }, [carId]);

  const handleLoadMore = () => {
    fetchCarComments(carId, pagination.currentPage + 1);
  };

  return (
    <section className="mt-12">
      <div
        className={`flex items-center gap-3 mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <MessageSquare className="w-5 h-5 text-zinc-500" />
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {t("carComments.comments")}
        </h2>
        {pagination.totalItems > 0 && (
          <Badge variant="secondary">{pagination.totalItems}</Badge>
        )}
      </div>

      {/* Input for logged-in users */}
      {isAuthenticated ? (
        <div className={`mb-8 flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs bg-zinc-200 dark:bg-zinc-700">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CommentInput
              carId={carId}
              placeholder={t("carComments.commentPlaceholder")}
            />
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-sm text-zinc-500 mb-3">
            {t("carComments.loginToJoin")}
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="/login">{t("auth.login.title")}</a>
          </Button>
        </div>
      )}

      {/* Comment list */}
      {loading && carComments.length === 0 ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-pulse ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div
                  className={`h-3 w-28 bg-zinc-200 dark:bg-zinc-800 rounded ${isRTL ? "mr-0" : ""}`}
                />
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded" />
                <div className="h-3 w-2/3 bg-zinc-100 dark:bg-zinc-900 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : carComments.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-zinc-200 dark:text-zinc-700 mx-auto mb-4" />
          <p className="font-semibold text-zinc-900 dark:text-white mb-1">
            {t("carComments.noComments")}
          </p>
          <p className="text-sm text-zinc-400">
            {t("carComments.beFirstToComment")}
          </p>
        </div>
      ) : (
        <div className="space-y-6 divide-y divide-zinc-100 dark:divide-zinc-800">
          <AnimatePresence initial={false}>
            {carComments.map((comment) => (
              <div key={comment._id} className="pt-6 first:pt-0">
                <CommentItem
                  comment={comment}
                  carId={carId}
                  currentUser={user}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Load more */}
      {pagination.currentPage < pagination.totalPages && (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
            {loading ? (
              <Loader2
                className={`w-4 h-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`}
              />
            ) : (
              <ChevronDown className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            )}
            {t("carComments.loadMore")}
          </Button>
        </div>
      )}
    </section>
  );
};
