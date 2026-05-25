import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Car, Download, Eye, Filter, Search, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "react-hot-toast";
import useBookingStore from "@/store/bookingStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BookingHistoryPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const { fetchUserBookings, loading, error } = useBookingStore(
    (state) => state,
  );
  const isRTL = i18n.language !== "en";

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          sortBy: "createdAt",
          sortOrder: "desc",
        };

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        const response = await fetchUserBookings(params);
        setBookings(response?.data?.bookings || []);

        if (response?.pagination) {
          setPagination({
            page: response.pagination.currentPage || 1,
            limit: response.pagination.itemsPerPage || 10,
            total: response.pagination.totalItems || 0,
            pages: response.pagination.totalPages || 0,
          });
        } else {
          setPagination({
            page: 1,
            limit: 10,
            total: response?.data?.bookings?.length || 0,
            pages: 1,
          });
        }
      } catch (err) {
        toast.error(error || t("bookingHistory.loadError"));
        console.log(err);

        setBookings([]);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        });
      }
    };

    fetchBookingHistory();
  }, [
    pagination.page,
    statusFilter,
    pagination.limit,
    fetchUserBookings,
    error,
    t,
  ]);

  const handleExport = () => {
    toast.success(t("bookingHistory.exportSuccess"));
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.car?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.car?.brand?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-600";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600";
      case "cancelled":
        return "bg-red-500/10 text-red-600";
      case "completed":
        return "bg-blue-500/10 text-blue-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return t("bookingHistory.statusConfirmed");
      case "pending":
        return t("bookingHistory.statusPending");
      case "cancelled":
        return t("bookingHistory.statusCancelled");
      case "completed":
        return t("bookingHistory.statusCompleted");
      default:
        return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <PageHeader
        title={t("bookingHistory.title")}
        description={t("bookingHistory.description")}
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            {t("bookingHistory.export")}
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div
            className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}
          >
            <div className="relative flex-1">
              <Search
                className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`}
              />
              <Input
                placeholder={t("bookingHistory.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? "pr-9 text-right" : "pl-9 text-left"}`}
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-37.5">
                <Filter className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                <SelectValue placeholder={t("bookingHistory.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="all"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("bookingHistory.allStatuses")}
                </SelectItem>
                <SelectItem
                  value="confirmed"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("bookingHistory.statusConfirmed")}
                </SelectItem>
                <SelectItem
                  value="pending"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("bookingHistory.statusPending")}
                </SelectItem>
                <SelectItem
                  value="completed"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("bookingHistory.statusCompleted")}
                </SelectItem>
                <SelectItem
                  value="cancelled"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("bookingHistory.statusCancelled")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t("bookingHistory.loading")}
              </p>
            </div>
          ) : filteredBookings.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("bookingHistory.car")}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("bookingHistory.dates")}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("bookingHistory.duration")}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("bookingHistory.total")}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t("bookingHistory.status")}
                      </TableHead>
                      <TableHead className={isRTL ? "text-left" : "text-right"}>
                        {t("bookingHistory.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => {
                      const start = new Date(booking.startDate);
                      const end = new Date(booking.endDate);
                      const days = Math.ceil(
                        (end.getTime() - start.getTime()) /
                          (1000 * 60 * 60 * 24),
                      );

                      return (
                        <TableRow key={booking._id}>
                          <TableCell>
                            <div
                              className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                            >
                              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                                <img
                                  src={
                                    booking.car?.images?.[0]?.url ||
                                    "/placeholder-car.jpg"
                                  }
                                  alt={
                                    booking.car?.name || t("bookingHistory.car")
                                  }
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p
                                  className={`font-medium ${isRTL ? "text-right" : "text-left"}`}
                                >
                                  {booking.car?.name}
                                </p>
                                <p
                                  className={`text-sm text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
                                >
                                  {booking.car?.brand} {booking.car?.carModel}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p
                              className={`font-medium ${isRTL ? "text-right" : "text-left"}`}
                            >
                              {formatDate(start)}
                            </p>
                            <p
                              className={`text-sm text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
                            >
                              {t("bookingHistory.until")} {formatDate(end)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {t("bookingHistory.daysCount", { count: days })}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`font-semibold ${isRTL ? "text-right" : "text-left"}`}
                          >
                            {formatCurrency(booking.totalPrice)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusText(booking.status)}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={isRTL ? "text-left" : "text-right"}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/bookings/${booking._id}`)
                              }
                            >
                              <Eye
                                className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`}
                              />
                              {t("bookingHistory.view")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination.pages > 1 && (
                <div className="p-4 border-t">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={(page) =>
                      setPagination((prev) => ({ ...prev, page }))
                    }
                  />
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery
                  ? t("bookingHistory.noResults")
                  : t("bookingHistory.noBookings")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? t("bookingHistory.noResultsForQuery", {
                      query: searchQuery,
                    })
                  : t("bookingHistory.noBookingsDescription")}
              </p>
              <Button onClick={() => navigate("/cars")}>
                {t("bookingHistory.viewCars")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BookingHistoryPage;
