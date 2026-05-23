import useCommentStore from "@/store/commentStore";
import { useState } from "react";
import toast from "react-hot-toast";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

const CommentInput = ({
  carId,
  parentId = null,
  placeholder,
  onSuccess,
  onCancel,
  initialValue = "",
  isEdit = false,
  commentId,
}) => {
  const { t, i18n } = useTranslation();
  const { createComment, updateComment, submitting } = useCommentStore();
  const [value, setValue] = useState(initialValue);
  const isRTL = i18n.language !== "en";
  const MAX_LENGTH = 500;

  const handleSubmit = async () => {
    if (!value.trim()) {
      toast.error(t("commentInput.commentRequired"));
      return;
    }

    const result = isEdit
      ? await updateComment(commentId, value, parentId)
      : await createComment(carId, value, parentId);

    if (result.success) {
      toast.success(
        isEdit
          ? t("commentInput.updateSuccess")
          : t("commentInput.createSuccess"),
      );
      setValue("");
      onSuccess?.();
    } else {
      toast.error(result.error || t("commentInput.errorMessage"));
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (isEdit) return t("commentInput.editPlaceholder");
    if (parentId) return t("commentInput.replyPlaceholder");
    return t("commentInput.writePlaceholder");
  };

  return (
    <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
      <div className="flex-1 space-y-2">
        <Textarea
          placeholder={getPlaceholder()}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          maxLength={MAX_LENGTH}
          className={`resize-none bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-400 ${isRTL ? "text-right" : "text-left"}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <div
          className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-xs text-zinc-400">
            {t("commentInput.charCount", {
              current: value.length,
              max: MAX_LENGTH,
            })}
          </span>
          <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                {t("commentInput.common.cancel")}
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || !value.trim()}
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Send
                    className={`w-3.5 h-3.5 ${isRTL ? "ml-1.5" : "mr-1.5"}`}
                  />
                  {isEdit ? t("commentInput.edit") : t("commentInput.post")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentInput;
