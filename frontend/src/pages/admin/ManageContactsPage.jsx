import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, MailOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import useContactStore from "@/store/contactStore";
import ContactDetailPanel from "@/components/contact/ContactDetailPanel";
import { useTranslation } from "react-i18next";

const AdminContactsPage = () => {
  const { t, i18n } = useTranslation();
  const {
    contacts,
    summary,
    pagination,
    loading,
    fetchAllContacts,
    fetchContactById,
    selectedContact,
    setSelectedContact,
  } = useContactStore();

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const isRTL = i18n.language !== "en";

  const getSubjectLabel = (subjectKey) => {
    switch (subjectKey) {
      case "general":
        return t("adminContact.subjects.general");
      case "booking":
        return t("adminContact.subjects.booking");
      case "complaint":
        return t("adminContact.subjects.complaint");
      case "partnership":
        return t("adminContact.subjects.partnership");
      case "other":
        return t("adminContact.subjects.other");
      default:
        return subjectKey;
    }
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return t("adminContact.justNow");
    if (diff < 3600)
      return t("adminContact.minutesAgo", { count: Math.floor(diff / 60) });
    if (diff < 86400)
      return t("adminContact.hoursAgo", { count: Math.floor(diff / 3600) });
    return new Date(date).toLocaleDateString(
      i18n.language === "en" ? "en-US" : "fa-IR",
    );
  };

  useEffect(() => {
    fetchAllContacts(1, 20, {
      status: activeTab === "all" ? "" : activeTab,
      subject,
      search,
    });
  }, [activeTab, subject, fetchAllContacts]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchAllContacts(1, 20, {
        status: activeTab === "all" ? "" : activeTab,
        subject,
        search,
      });
    }, 400);
    return () => clearTimeout(t);
  }, [search, activeTab, subject, fetchAllContacts]);

  const handleOpen = async (contact) => {
    try {
      await fetchContactById(contact._id);
    } catch {
      toast.error(t("adminContact.errorLoadingMessage"));
    }
  };

  return (
    <div
      className="flex h-[calc(100vh-4rem)] overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ── List panel ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "flex flex-col border-l border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-200",
          selectedContact ? "hidden lg:flex lg:w-96" : "flex w-full",
        )}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 space-y-4 shrink-0">
          <div
            className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <PageHeader
              title={t("adminContacts.title")}
              description={t("adminContacts.description")}
            />

            <div className="flex gap-2 text-xs">
              {summary.unread > 0 && (
                <span className="bg-blue-500 text-white rounded-full px-2 py-0.5 font-medium">
                  {t("adminContacts.newCount", { count: summary.unread })}
                </span>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400`}
            />
            <Input
              placeholder={t("adminContacts.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${isRTL ? "pr-9" : "pl-9"} text-sm ${isRTL ? "text-right" : "text-left"}`}
            />
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <TabsList className="w-full grid grid-cols-4 h-8">
              <TabsTrigger value="unread" className="text-xs">
                {t("adminContacts.unread")}
                {summary.unread > 0 && ` (${summary.unread})`}
              </TabsTrigger>
              <TabsTrigger value="read" className="text-xs">
                {t("adminContacts.read")}
              </TabsTrigger>
              <TabsTrigger value="replied" className="text-xs">
                {t("adminContacts.replied")}
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs">
                {t("adminContacts.all")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Subject filter */}
          <Select
            value={subject || "all"}
            onValueChange={(v) => setSubject(v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={t("adminContacts.allSubjects")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("adminContacts.allSubjects")}
              </SelectItem>
              {["general", "booking", "complaint", "partnership", "other"].map(
                (k) => (
                  <SelectItem key={k} value={k} className="text-xs">
                    {getSubjectLabel(k)}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {loading && contacts.length === 0 ? (
            <div className="space-y-1 p-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg animate-pulse flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div
                      className={`h-3 w-28 bg-zinc-200 dark:bg-zinc-800 rounded ${isRTL ? "mr-auto" : ""}`}
                    />
                    <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
              <MailOpen className="w-12 h-12 text-zinc-200 dark:text-zinc-700 mb-4" />
              <p className="font-medium text-zinc-900 dark:text-white mb-1">
                {t("adminContacts.noMessages")}
              </p>
              <p className="text-sm text-zinc-400">
                {search
                  ? t("adminContacts.noSearchResults")
                  : t("adminContacts.allManaged")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50 dark:divide-zinc-900">
              {contacts.map((contact) => (
                <button
                  key={contact._id}
                  onClick={() => handleOpen(contact)}
                  className={cn(
                    "w-full text-right p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex gap-3",
                    selectedContact?._id === contact._id &&
                      "bg-zinc-100 dark:bg-zinc-900",
                    contact.status === "unread" && "border-r-2 border-blue-500",
                    isRTL ? "flex-row-reverse" : "",
                  )}
                >
                  <Avatar className="w-9 h-9 shrink-0 mt-0.5">
                    <AvatarImage src={contact.user?.avatar} />
                    <AvatarFallback className="text-xs bg-zinc-200 dark:bg-zinc-700">
                      {contact.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`flex items-center justify-between gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <span
                        className={cn(
                          "text-sm truncate",
                          contact.status === "unread"
                            ? "font-semibold text-zinc-900 dark:text-white"
                            : "font-medium text-zinc-700 dark:text-zinc-300",
                          isRTL ? "text-right" : "text-left",
                        )}
                      >
                        {contact.name}
                      </span>
                      <span className="text-xs text-zinc-400 shrink-0">
                        {timeAgo(contact.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`text-xs text-zinc-400 truncate mb-1 ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {getSubjectLabel(contact.subject)} · {contact.email}
                    </p>
                    <p
                      className={`text-xs text-zinc-500 dark:text-zinc-400 truncate ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {contact.message}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) =>
                fetchAllContacts(page, 20, {
                  status: activeTab === "all" ? "" : activeTab,
                  subject,
                  search,
                })
              }
            />
          </div>
        )}
      </motion.div>

      {/* ── Detail panel ───────────────────────────── */}
      <div
        className={cn(
          "flex-1 bg-white dark:bg-zinc-950",
          !selectedContact &&
            "hidden lg:flex lg:items-center lg:justify-center",
        )}
      >
        <AnimatePresence mode="wait">
          {selectedContact ? (
            <motion.div
              key={selectedContact._id}
              initial={{ opacity: 0, x: isRTL ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ContactDetailPanel
                contact={selectedContact}
                onClose={() => setSelectedContact(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Mail className="w-16 h-16 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">
                {t("adminContacts.selectMessage")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminContactsPage;
