import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
  Reply,
  Clock,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import useCommentStore from "@/store/commentStore";
import { useTranslation } from "react-i18next";

const ManageCommentsPage = () => {
  const { t, i18n } = useTranslation();
  const {
    allComments,
    pagination,
    loading,
    submitting,
    fetchAllComments,
    moderateComment,
    adminDeleteComment,
    replyToComment,
  } = useCommentStore();

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [replyDialog, setReplyDialog] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [viewDialog, setViewDialog] = useState(null);
  const isRTL = i18n.language !== "en";

  useEffect(() => {
    fetchAllComments(1, 20, activeTab === "all" ? "" : activeTab);
  }, [activeTab, fetchAllComments]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          label: t("manageComments.statusPending"),
          color: "bg-amber-100 text-amber-700 border-amber-200",
          icon: Clock,
        };
      case "approved":
        return {
          label: t("manageComments.statusApproved"),
          color: "bg-emerald-100 text-emerald-700 border-emerald-200",
          icon: CheckCircle,
        };
      case "rejected":
        return {
          label: t("manageComments.statusRejected"),
          color: "bg-red-100 text-red-700 border-red-200",
          icon: XCircle,
        };
      default:
        return {
          label: t("manageComments.statusPending"),
          color: "bg-amber-100 text-amber-700 border-amber-200",
          icon: Clock,
        };
    }
  };

  const StatusBadge = ({ status }) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
          config.color,
        )}
      >
        <Icon className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />
        {config.label}
      </span>
    );
  };

  const handleModerate = async (id, status) => {
    const result = await moderateComment(id, status);
    if (result.success) {
      toast.success(
        status === "approved"
          ? t("manageComments.approveSuccess")
          : t("manageComments.rejectSuccess"),
      );
    } else {
      toast.error(result.error || t("manageComments.moderationError"));
    }
  };

  const handleDelete = async () => {
    const result = await adminDeleteComment(deleteId);
    if (result.success) {
      toast.success(t("manageComments.deleteSuccess"));
    } else {
      toast.error(result.error || t("manageComments.deleteError"));
    }
    setDeleteId(null);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      toast.error(t("manageComments.replyRequired"));
      return;
    }
    const result = await replyToComment(replyDialog._id, replyText);
    if (result.success) {
      toast.success(t("manageComments.replySuccess"));
      setReplyDialog(null);
      setReplyText("");
    } else {
      toast.error(result.error || t("manageComments.replyError"));
    }
  };

  // Client-side search filter
  const filtered = allComments.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.content?.toLowerCase().includes(q) ||
      c.user?.name?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q) ||
      c.car?.name?.toLowerCase().includes(q)
    );
  });

  const counts = {
    pending: allComments.filter((c) => c.status === "pending").length,
    approved: allComments.filter((c) => c.status === "approved").length,
    rejected: allComments.filter((c) => c.status === "rejected").length,
  };

  const statusConfigs = {
    pending: getStatusConfig("pending"),
    approved: getStatusConfig("approved"),
    rejected: getStatusConfig("rejected"),
  };

  const formatLocalDate = (date) => {
    const locale =
      i18n.language === "en"
        ? "en-US"
        : i18n.language === "fa"
          ? "fa-IR"
          : "ps-AF";
    return new Date(date).toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <PageHeader
        title={t("manageComments.title")}
        description={t("manageComments.description")}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(statusConfigs).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <Card
              key={key}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setActiveTab(key)}
            >
              <CardContent
                className={`p-5 flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div className={cn("p-3 rounded-xl border", cfg.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="text-2xl font-bold">{counts[key] ?? 0}</p>
                  <p className="text-sm text-muted-foreground">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div
        className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${isRTL ? "sm:flex-row-reverse" : ""}`}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <TabsList>
            <TabsTrigger value="all">{t("manageComments.all")}</TabsTrigger>
            <TabsTrigger value="pending">
              {t("manageComments.statusPending")}
              {counts.pending > 0 && (
                <span className="mr-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {counts.pending}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              {t("manageComments.statusApproved")}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              {t("manageComments.statusRejected")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search
            className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`}
          />
          <Input
            placeholder={t("manageComments.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${isRTL ? "pr-9 text-right" : "pl-9 text-left"}`}
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`p-5 flex gap-4 animate-pulse ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div
                      className={`h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded ${isRTL ? "mr-auto" : ""}`}
                    />
                    <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded" />
                    <div className="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-900 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <MessageSquare className="w-12 h-12 text-zinc-200 dark:text-zinc-700 mx-auto mb-4" />
              <p className="font-semibold text-zinc-900 dark:text-white mb-1">
                {t("manageComments.noCommentsFound")}
              </p>
              <p className="text-sm text-zinc-400">
                {search
                  ? t("manageComments.tryDifferentSearch")
                  : t("manageComments.allClear")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((comment) => (
                <motion.div
                  key={comment._id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <div
                    className={`flex gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarImage src={comment.user?.avatar} />
                      <AvatarFallback className="text-xs bg-zinc-200 dark:bg-zinc-700">
                        {comment.user?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`flex flex-wrap items-center gap-2 mb-1 ${isRTL ? "justify-end" : "justify-start"}`}
                      >
                        <span className="font-medium text-sm">
                          {comment.user?.name}
                        </span>
                        <span className="text-xs text-zinc-400" dir="ltr">
                          {comment.user?.email}
                        </span>
                        <StatusBadge status={comment.status} />
                        {comment.parent && (
                          <Badge variant="outline" className="text-xs">
                            {t("manageComments.reply")}
                          </Badge>
                        )}
                      </div>

                      {/* Car reference */}
                      {comment.car && (
                        <p
                          className={`text-xs text-zinc-400 mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
                        >
                          {t("manageComments.onCar")}:{" "}
                          <span className="font-medium text-zinc-600 dark:text-zinc-300">
                            {comment.car.name} ({comment.car.brand})
                          </span>
                        </p>
                      )}

                      <p
                        className={`text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 ${isRTL ? "text-right" : "text-left"}`}
                      >
                        {comment.content}
                      </p>

                      {comment.parent && (
                        <p
                          className={`text-xs text-zinc-400 mt-1 ${isRTL ? "text-right" : "text-left"}`}
                        >
                          {t("manageComments.inReplyTo")}: "
                          {comment.parent?.content?.slice(0, 60)}..."
                        </p>
                      )}

                      {comment.adminReply && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
                          <p
                            className={`text-xs text-blue-700 dark:text-blue-400 ${isRTL ? "text-right" : "text-left"}`}
                          >
                            <span className="font-semibold">
                              {t("manageComments.yourReply")}:{" "}
                            </span>
                            {comment.adminReply}
                          </p>
                        </div>
                      )}

                      <p
                        className={`text-xs text-zinc-400 mt-2 ${isRTL ? "text-right" : "text-left"}`}
                      >
                        {formatLocalDate(comment.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {comment.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8"
                            onClick={() =>
                              handleModerate(comment._id, "approved")
                            }
                          >
                            <CheckCircle
                              className={`w-3.5 h-3.5 ${isRTL ? "ml-1" : "mr-1"}`}
                            />
                            {t("manageComments.approve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 h-8"
                            onClick={() =>
                              handleModerate(comment._id, "rejected")
                            }
                          >
                            <XCircle
                              className={`w-3.5 h-3.5 ${isRTL ? "ml-1" : "mr-1"}`}
                            />
                            {t("manageComments.reject")}
                          </Button>
                        </>
                      )}

                      {comment.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => {
                            setReplyDialog(comment);
                            setReplyText(comment.adminReply || "");
                          }}
                        >
                          <Reply
                            className={`w-3.5 h-3.5 ${isRTL ? "ml-1" : "mr-1"}`}
                          />
                          {comment.adminReply
                            ? t("manageComments.editReply")
                            : t("manageComments.reply")}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-zinc-400 hover:text-zinc-700"
                        onClick={() => setViewDialog(comment)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(comment._id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(page) =>
            fetchAllComments(page, 20, activeTab === "all" ? "" : activeTab)
          }
        />
      )}

      {/* Reply Dialog */}
      <Dialog open={!!replyDialog} onOpenChange={() => setReplyDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className={isRTL ? "text-right" : "text-left"}>
              {t("manageComments.replyToComment")}
            </DialogTitle>
          </DialogHeader>
          {replyDialog && (
            <div className="space-y-4">
              <div
                className={`p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border text-sm text-zinc-600 dark:text-zinc-400 ${isRTL ? "text-right" : "text-left"}`}
              >
                <p
                  className={`font-medium text-zinc-800 dark:text-zinc-200 mb-1 ${isRTL ? "text-right" : "text-left"}`}
                >
                  {replyDialog.user?.name}
                </p>
                {replyDialog.content}
              </div>
              <Textarea
                placeholder={t("manageComments.replyPlaceholder")}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                maxLength={500}
                className={`resize-none ${isRTL ? "text-right" : "text-left"}`}
              />
            </div>
          )}
          <DialogFooter
            className={isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""}
          >
            <Button variant="ghost" onClick={() => setReplyDialog(null)}>
              {t("manageComments.common.cancel")}
            </Button>
            <Button
              onClick={handleReplySubmit}
              disabled={submitting || !replyText.trim()}
              className={isRTL ? "mr-2 sm:mr-0 sm:ml-2" : ""}
            >
              {submitting
                ? t("manageComments.common.sending")
                : t("manageComments.sendReply")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Full Comment Dialog */}
      <Dialog open={!!viewDialog} onOpenChange={() => setViewDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={isRTL ? "text-right" : "text-left"}>
              {t("manageComments.viewFullComment")}
            </DialogTitle>
          </DialogHeader>
          {viewDialog && (
            <div className="space-y-3">
              <div
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="w-9 h-9">
                  <AvatarImage src={viewDialog.user?.avatar} />
                  <AvatarFallback>{viewDialog.user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="font-medium text-sm">{viewDialog.user?.name}</p>
                  <p className="text-xs text-zinc-400" dir="ltr">
                    {viewDialog.user?.email}
                  </p>
                </div>
                <StatusBadge status={viewDialog.status} />
              </div>
              <p
                className={`text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
              >
                {viewDialog.content}
              </p>
              {viewDialog.car && (
                <p
                  className={`text-xs text-zinc-400 ${isRTL ? "text-right" : "text-left"}`}
                >
                  {t("manageComments.car")}: {viewDialog.car.name}
                </p>
              )}
              <p
                className={`text-xs text-zinc-400 ${isRTL ? "text-right" : "text-left"}`}
              >
                {formatLocalDate(viewDialog.createdAt)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={isRTL ? "text-right" : "text-left"}>
              {t("manageComments.deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("manageComments.deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter
            className={isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""}
          >
            <AlertDialogCancel>
              {t("manageComments.common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t("manageComments.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ManageCommentsPage;
