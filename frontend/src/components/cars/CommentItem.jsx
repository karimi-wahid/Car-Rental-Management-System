import { cn } from "@/lib/utils";
import useCommentStore from "@/store/commentStore";
import { useState } from "react";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import CommentInput from "./CommentInput";
import {
  ChevronDown,
  Edit2,
  Heart,
  Loader2,
  MoreHorizontal,
  Reply,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
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

const CommentItem = ({ comment, carId, currentUser, isReply = false }) => {
  const { t, i18n } = useTranslation();
  const { deleteComment, toggleLike, fetchMoreReplies } = useCommentStore();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const isRTL = i18n.language !== "en";

  const isOwner = comment.user?._id === currentUser?._id;
  const isLiked = comment.liked;
  const likeCount = comment.likeCount ?? comment.likes?.length ?? 0;
  const replies = comment.replies || [];
  const replyCount = comment.replyCount ?? replies.length;

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return t("commentItem.justNow");
    if (diff < 3600)
      return t("commentItem.minutesAgo", { count: Math.floor(diff / 60) });
    if (diff < 86400)
      return t("commentItem.hoursAgo", { count: Math.floor(diff / 3600) });
    if (diff < 604800)
      return t("commentItem.daysAgo", { count: Math.floor(diff / 86400) });

    const locale =
      i18n.language === "en"
        ? "en-US"
        : i18n.language === "fa"
          ? "fa-IR"
          : "ps-AF";
    return new Date(date).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    const result = await deleteComment(
      deleteId,
      isReply ? comment.parent : null,
    );
    if (result.success) toast.success(t("commentItem.deleteSuccess"));
    else toast.error(result.error || t("commentItem.deleteError"));
    setDeleteId(null);
  };

  const handleLike = async () => {
    if (!currentUser) {
      toast.error(t("commentItem.loginToLike"));
      return;
    }
    try {
      await toggleLike(comment._id, isReply ? comment.parent : null);
    } catch {
      toast.error(t("commentItem.likeError"));
    }
  };

  const handleLoadReplies = async () => {
    if (!showReplies) {
      setShowReplies(true);
      if (replies.length === 0 && replyCount > 0) {
        setLoadingReplies(true);
        try {
          await fetchMoreReplies(comment._id, 1);
        } finally {
          setLoadingReplies(false);
        }
      }
    } else {
      setShowReplies(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className={cn(
          "group",
          isReply && (isRTL ? "pr-4 border-r-2" : "pl-4 border-l-2"),
          isReply && "border-zinc-100 dark:border-zinc-800",
        )}
      >
        <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Avatar className={cn("shrink-0", isReply ? "w-7 h-7" : "w-9 h-9")}>
            <AvatarImage src={comment.user?.avatar} />
            <AvatarFallback className="text-xs bg-zinc-200 dark:bg-zinc-700">
              {getInitials(comment.user?.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div
              className={`flex items-center gap-2 mb-1 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <span className="font-medium text-sm text-zinc-900 dark:text-white">
                {comment.user?.name || t("commentItem.anonymous")}
              </span>
              <span className="text-xs text-zinc-400">
                {timeAgo(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-zinc-400">
                  ({t("commentItem.edited")})
                </span>
              )}
              {comment.status === "pending" && isOwner && (
                <Badge
                  variant="outline"
                  className="text-xs py-0 px-1.5 text-amber-600 border-amber-200"
                >
                  {t("commentItem.pendingApproval")}
                </Badge>
              )}
            </div>

            {editing ? (
              <CommentInput
                carId={carId}
                parentId={isReply ? comment.parent : null}
                commentId={comment._id}
                initialValue={comment.content}
                isEdit
                onSuccess={() => setEditing(false)}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <p
                className={`text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed wrap-break-word ${isRTL ? "text-right" : "text-left"}`}
              >
                {comment.content}
              </p>
            )}

            {/* Admin reply */}
            {comment.adminReply && (
              <div
                className={`mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl ${isRTL ? "text-right" : "text-left"}`}
              >
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                  {t("commentItem.teamResponse")}
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  {comment.adminReply}
                </p>
              </div>
            )}

            {/* Actions */}
            {!editing && (
              <div
                className={`flex items-center gap-4 mt-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <button
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-1.5 text-xs transition-colors",
                    isLiked
                      ? "text-rose-500"
                      : "text-zinc-400 hover:text-rose-500",
                  )}
                >
                  <Heart
                    className={cn("w-3.5 h-3.5", isLiked && "fill-rose-500")}
                  />
                  {likeCount > 0 && likeCount}
                </button>

                {!isReply && currentUser && (
                  <button
                    onClick={() => setReplying(!replying)}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    {t("commentItem.reply")}
                  </button>
                )}

                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? "end" : "start"}>
                      {comment.status !== "approved" && (
                        <DropdownMenuItem
                          onClick={() => setEditing(true)}
                          className={isRTL ? "flex-row-reverse" : ""}
                        >
                          <Edit2
                            className={cn(
                              "w-3.5 h-3.5",
                              isRTL ? "ml-2" : "mr-2",
                            )}
                          />
                          {t("commentItem.edit")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setDeleteId(comment._id)}
                        className={`text-destructive ${isRTL ? "flex-row-reverse" : ""}`}
                      >
                        <Trash2
                          className={cn("w-3.5 h-3.5", isRTL ? "ml-2" : "mr-2")}
                        />
                        {t("commentItem.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}

            {/* Reply input */}
            <AnimatePresence>
              {replying && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <CommentInput
                    carId={carId}
                    parentId={comment._id}
                    placeholder={t("commentItem.replyToUser", {
                      name: comment.user?.name || t("commentItem.anonymous"),
                    })}
                    onSuccess={() => {
                      setReplying(false);
                      setShowReplies(true);
                    }}
                    onCancel={() => setReplying(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Load replies toggle */}
            {!isReply && replyCount > 0 && (
              <button
                onClick={handleLoadReplies}
                className={`flex items-center gap-1.5 mt-3 text-xs text-primary hover:underline ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform",
                    showReplies && "rotate-180",
                  )}
                />
                {showReplies
                  ? t("commentItem.hideReplies")
                  : t("commentItem.showRepliesCount", { count: replyCount })}
              </button>
            )}

            {/* Replies */}
            <AnimatePresence>
              {showReplies && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4 overflow-hidden"
                >
                  {loadingReplies ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    </div>
                  ) : (
                    <AnimatePresence>
                      {replies.map((reply) => (
                        <CommentItem
                          key={reply._id}
                          comment={reply}
                          carId={carId}
                          currentUser={currentUser}
                          isReply
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={isRTL ? "text-right" : "text-left"}>
              {t("commentItem.deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("commentItem.deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter
            className={isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""}
          >
            <AlertDialogCancel>
              {t("commentItem.common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className={`bg-destructive hover:bg-destructive/90 ${isRTL ? "mr-2 sm:mr-0 sm:ml-2" : ""}`}
            >
              {t("commentItem.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CommentItem;
