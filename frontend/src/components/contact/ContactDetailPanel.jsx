import { cn } from "@/lib/utils";
import useContactStore from "@/store/contactStore";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Mail,
  MailOpen,
  Reply,
  Trash2,
  XCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
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
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useTranslation } from "react-i18next";

const ContactDetailPanel = ({ contact, onClose }) => {
  const { t, i18n } = useTranslation();
  const {
    replyToContact,
    updateStatus,
    markAsSpam,
    submitting,
    deleteContact,
  } = useContactStore();
  const [replyText, setReplyText] = useState(contact.adminReply || "");
  const [deleteId, setDeleteId] = useState(null);
  const isRTL = i18n.language !== "en";

  const getStatusConfig = (status) => {
    switch (status) {
      case "unread":
        return {
          label: t("contactDetail.statusUnread"),
          icon: Mail,
          color:
            "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
        };
      case "read":
        return {
          label: t("contactDetail.statusRead"),
          icon: MailOpen,
          color:
            "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
        };
      case "replied":
        return {
          label: t("contactDetail.statusReplied"),
          icon: CheckCircle,
          color:
            "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
        };
      case "closed":
        return {
          label: t("contactDetail.statusClosed"),
          icon: XCircle,
          color:
            "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700",
        };
      default:
        return {
          label: t("contactDetail.statusRead"),
          icon: MailOpen,
          color:
            "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
        };
    }
  };

  const getSubjectLabel = (subjectKey) => {
    switch (subjectKey) {
      case "general":
        return t("contact.subjects.general");
      case "booking":
        return t("contact.subjects.booking");
      case "complaint":
        return t("contact.subjects.complaint");
      case "partnership":
        return t("contact.subjects.partnership");
      case "other":
        return t("contact.subjects.other");
      default:
        return subjectKey;
    }
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return t("contact.justNow");
    if (diff < 3600)
      return t("contact.minutesAgo", { count: Math.floor(diff / 60) });
    if (diff < 86400)
      return t("contact.hoursAgo", { count: Math.floor(diff / 3600) });
    return new Date(date).toLocaleDateString(
      i18n.language === "en" ? "en-US" : "fa-IR",
    );
  };

  const StatusBadge = ({ status }) => {
    const cfg = getStatusConfig(status);
    const Icon = cfg.icon;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
          cfg.color,
        )}
      >
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error(t("contactDetail.replyRequired"));
      return;
    }
    const result = await replyToContact(contact._id, replyText);
    if (result.success) toast.success(t("contactDetail.replySuccess"));
    else toast.error(result.error || t("contactDetail.replyError"));
  };

  const handleSpam = async () => {
    const result = await markAsSpam(contact._id);
    if (result.success) {
      toast.success(t("contactDetail.spamSuccess"));
      onClose();
    } else toast.error(result.error || t("contactDetail.spamError"));
  };

  const handleDelete = async () => {
    const result = await deleteContact(deleteId);
    if (result.success) {
      toast.success(t("contactDetail.deleteSuccess"));
      onClose();
    } else toast.error(result.error || t("contactDetail.deleteError"));
    setDeleteId(null);
  };

  const handleStatusChange = async (newStatus) => {
    const result = await updateStatus(contact._id, newStatus);
    if (!result.success) {
      toast.error(result.error || t("contactDetail.statusUpdateError"));
    }
  };

  const statusOptions = [
    { value: "unread", label: t("contactDetail.statusUnread") },
    { value: "read", label: t("contactDetail.statusRead") },
    { value: "replied", label: t("contactDetail.statusReplied") },
    { value: "closed", label: t("contactDetail.statusClosed") },
  ];

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div
        className={`flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          aria-label={t("contactDetail.close")}
        >
          <ChevronIcon className="w-5 h-5" />
        </button>
        <div
          className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <StatusBadge status={contact.status} />
          <Select value={contact.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Sender info */}
        <div
          className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <Avatar className="w-11 h-11">
            <AvatarImage src={contact.user?.avatar} />
            <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700">
              {contact.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className={isRTL ? "text-right" : "text-left"}>
            <p className="font-semibold text-zinc-900 dark:text-white">
              {contact.name}
            </p>
            <p className="text-sm text-zinc-400">{contact.email}</p>
            {contact.phone && (
              <p className="text-xs text-zinc-400">{contact.phone}</p>
            )}
          </div>
        </div>

        {/* Subject & time */}
        <div
          className={`flex items-center gap-3 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <Badge variant="outline">{getSubjectLabel(contact.subject)}</Badge>
          <span className="text-xs text-zinc-400">
            {timeAgo(contact.createdAt)}
          </span>
          {contact.bookingId && (
            <Badge variant="secondary" className="text-xs">
              {t("contactDetail.bookingRef")}:{" "}
              {contact.bookingId._id?.slice(-6).toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Message */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {contact.message}
          </p>
        </div>

        {/* Previous reply */}
        {contact.adminReply && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {t("contactDetail.replySent")}
              {contact.adminRepliedAt && (
                <span className="font-normal text-emerald-500 mr-1">
                  — {timeAgo(contact.adminRepliedAt)}
                </span>
              )}
            </p>
            <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
              {contact.adminReply}
            </p>
          </div>
        )}

        {/* Reply box */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {contact.adminReply
              ? t("contactDetail.editReply")
              : t("contactDetail.sendReply")}
          </p>
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={5}
            placeholder={t("contactDetail.replyPlaceholder")}
            className="resize-none bg-white dark:bg-zinc-900"
            maxLength={2000}
          />
          <div
            className={`flex justify-between items-center ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <span className="text-xs text-zinc-400">
              {t("contactDetail.charCount", {
                current: replyText.length,
                max: 2000,
              })}
            </span>
            <Button
              onClick={handleReply}
              disabled={submitting || !replyText.trim()}
              size="sm"
            >
              {submitting ? (
                <Loader2
                  className={`w-4 h-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`}
                />
              ) : (
                <Reply className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              )}
              {t("contactDetail.sendReply")}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div
        className={`p-5 border-t border-zinc-100 dark:border-zinc-800 flex gap-2 shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <Button
          variant="outline"
          size="sm"
          className="text-amber-600 border-amber-200 hover:bg-amber-50"
          onClick={handleSpam}
        >
          <AlertTriangle
            className={`w-3.5 h-3.5 ${isRTL ? "ml-1.5" : "mr-1.5"}`}
          />
          {t("contactDetail.spam")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => setDeleteId(contact._id)}
        >
          <Trash2 className={`w-3.5 h-3.5 ${isRTL ? "ml-1.5" : "mr-1.5"}`} />
          {t("contactDetail.delete")}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={isRTL ? "text-right" : "text-left"}>
              {t("contactDetail.deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("contactDetail.deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRTL ? "flex-row-reverse" : ""}>
            <AlertDialogCancel>
              {t("contactDetail.common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t("contactDetail.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContactDetailPanel;
