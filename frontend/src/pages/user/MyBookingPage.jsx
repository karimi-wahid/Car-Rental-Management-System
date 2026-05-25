import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Filter, Search, X, Calendar, Car, AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { BookingCard } from "@/components/user/BookingCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/ui/pagination";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import useBookingStore from "@/store/bookingStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MyBookingsPage = () => {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const {
    fetchUserBookings,
    cancelBooking,
    loading,
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    },
    setPagination,
  } = useBookingStore();
  const bookings = useBookingStore((state) => state.userBookings) || [];
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const isRTL = i18n.language !== "en";

  const currentPage = useBookingStore(
    (state) => state.pagination?.currentPage ?? 1,
  );
  const itemsPerPage = useBookingStore(
    (state) => state.pagination?.itemsPerPage ?? 10,
  );

  useEffect(() => {
    fetchUserBookings({
      status: activeTab !== "all" ? activeTab : "",
      page: currentPage,
      limit: itemsPerPage,
    });
  }, [fetchUserBookings, activeTab, currentPage, itemsPerPage]);

  const handleCancelBooking = async (id) => {
    try {
      await cancelBooking(id, t("myBookings.cancelledByUser"));
      toast.success(t("myBookings.cancelSuccess"));
    } catch (error) {
      toast.error(t("myBookings.cancelError"));
      console.log(error);
    }
  };

  const handleModifyBooking = (bookingId) =>
    navigate(`/bookings/${bookingId}/modify`);

  const handleViewDetails = (bookingId) => navigate(`/bookings/${bookingId}`);

  const filteredBookings = useMemo(() => {
    return (bookings || []).filter(
      (booking) =>
        booking.car?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.car?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking._id?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [bookings, searchQuery]);

  const tabs = [
    { value: "cancelled", label: t("myBookings.cancelled") },
    { value: "completed", label: t("myBookings.completed") },
    { value: "active", label: t("myBookings.active") },
    { value: "confirmed", label: t("myBookings.confirmed") },
    { value: "pending", label: t("myBookings.pending") },
    { value: "all", label: t("myBookings.allBookings") },
  ];

  const getStatusCount = (status) => {
    if (status === "all") return bookings.length;
    return bookings.filter((b) => b.status === status).length;
  };

  const getEmptyStateMessage = () => {
    if (searchQuery) {
      return {
        title: t("myBookings.noResultsFound"),
        description: t("myBookings.noResultsForQuery", { query: searchQuery }),
      };
    }

    if (activeTab !== "all") {
      const tabLabel = tabs.find((t) => t.value === activeTab)?.label;
      return {
        title: t("myBookings.noBookingsFound", { status: tabLabel }),
        description: t("myBookings.noBookingsWithStatus", { status: tabLabel }),
      };
    }

    return {
      title: t("myBookings.noBookingsTitle"),
      description: t("myBookings.noBookingsDescription"),
    };
  };

  const emptyState = getEmptyStateMessage();

  const activeBookingsCount = bookings.filter((b) =>
    ["confirmed", "active"].includes(b.status),
  ).length;
  const completedBookingsCount = bookings.filter(
    (b) => b.status === "completed",
  ).length;
  const pendingBookingsCount = bookings.filter(
    (b) => b.status === "pending",
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <PageHeader
        title={t("myBookings.myBookings")}
        description={t("myBookings.welcomeMessage", {
          name: user?.name || t("myBookings.user"),
        })}
      />

      {/* Quick Stats */}
      {!loading && bookings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
            <p className="text-sm text-muted-foreground mb-1">
              {t("myBookings.totalBookings")}
            </p>
            <p className="text-2xl font-bold">{bookings.length}</p>
          </div>
          <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/10">
            <p className="text-sm text-muted-foreground mb-1">
              {t("myBookings.active")}
            </p>
            <p className="text-2xl font-bold text-green-600">
              {activeBookingsCount}
            </p>
          </div>
          <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/10">
            <p className="text-sm text-muted-foreground mb-1">
              {t("myBookings.completed")}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {completedBookingsCount}
            </p>
          </div>
          <div className="bg-orange-500/5 rounded-lg p-4 border border-orange-500/10">
            <p className="text-sm text-muted-foreground mb-1">
              {t("myBookings.pending")}
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {pendingBookingsCount}
            </p>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div
        className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 ${isRTL ? "" : "lg:flex-row-reverse"}`}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full lg:w-auto"
        >
          <TabsList
            className={`grid grid-cols-3 lg:grid-cols-6 w-full lg:w-auto gap-1 ${isRTL ? "" : "order-last"}`}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="relative"
              >
                {tab.label}
                {getStatusCount(tab.value) > 0 && (
                  <span className="absolute -top-3 -right-2 h-5 w-5 text-xs bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    {getStatusCount(tab.value)}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div
          className={`flex items-center gap-3 w-full lg:w-auto ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <div className="relative w-full lg:w-64 xl:w-80">
            <Search
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`}
            />
            <Input
              placeholder={t("myBookings.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${isRTL ? "pr-9" : "pl-9"} w-full`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-xl">
              <div className="p-4 space-y-3">
                <div className="h-48 bg-muted-foreground/10 rounded-lg" />
                <div className="h-4 bg-muted-foreground/10 rounded w-3/4" />
                <div className="h-4 bg-muted-foreground/10 rounded w-1/2" />
                <div className="h-10 bg-muted-foreground/10 rounded-lg mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancel={handleCancelBooking}
                onModify={handleModifyBooking}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setPagination({ currentPage: page })}
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={searchQuery ? Search : Calendar}
          title={emptyState.title}
          description={emptyState.description}
          action={
            !searchQuery && activeTab === "all"
              ? {
                  label: t("myBookings.viewCars"),
                  onClick: () => navigate("/cars"),
                }
              : undefined
          }
          secondaryAction={
            searchQuery
              ? {
                  label: t("myBookings.clearFilters"),
                  onClick: () => {
                    setSearchQuery("");
                    setActiveTab("all");
                  },
                }
              : undefined
          }
        />
      )}
    </motion.div>
  );
};

export default MyBookingsPage;
