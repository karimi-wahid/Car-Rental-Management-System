import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Filter, Eye, Calendar } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { toast } from "react-hot-toast";
import useBookingStore from "@/store/bookingStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ManageBookingsPage = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const navigate = useNavigate();
  const isRTL = i18n.language !== "en";

  const {
    bookings,
    loading,
    error,
    pagination,
    fetchAllBookings,
    updateBookingStatus,
  } = useBookingStore();

  const {
    currentPage = 1,
    totalPages = 1,
    itemsPerPage = 10,
  } = pagination || {};

  useEffect(() => {
    fetchAllBookings(currentPage, itemsPerPage);
  }, [fetchAllBookings, currentPage, itemsPerPage]);

  const handleStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) return;

    try {
      await updateBookingStatus(selectedBooking._id, newStatus, statusNote);
      toast.success(
        t("manageBookings.statusUpdateSuccess", {
          status: getStatusText(newStatus),
        }),
      );
      setIsStatusDialogOpen(false);
      setStatusNote("");
      setNewStatus("");
    } catch (err) {
      toast.error(error || t("manageBookings.statusUpdateError"));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return t("manageBookings.statusConfirmed");
      case "pending":
        return t("manageBookings.statusPending");
      case "cancelled":
        return t("manageBookings.statusCancelled");
      default:
        return status;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter !== "all" && booking.status !== statusFilter) {
      return false;
    }

    if (!searchQuery) return true;

    const carMatch = booking.car?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const userMatch =
      booking.user &&
      typeof booking.user !== "string" &&
      booking.user.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return carMatch || userMatch;
  });

  const statusOptions = [
    { value: "pending", label: t("manageBookings.statusPending") },
    { value: "confirmed", label: t("manageBookings.statusConfirmed") },
    { value: "cancelled", label: t("manageBookings.statusCancelled") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <PageHeader
        title={t("manageBookings.title")}
        description={t("manageBookings.description")}
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
                placeholder={t("manageBookings.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? "pr-9 text-right" : "pl-9 text-left"}`}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-45">
                <Filter className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                <SelectValue placeholder={t("manageBookings.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="all"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("manageBookings.allBookings")}
                </SelectItem>
                <SelectItem
                  value="pending"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("manageBookings.statusPending")}
                </SelectItem>
                <SelectItem
                  value="confirmed"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("manageBookings.statusConfirmed")}
                </SelectItem>
                <SelectItem
                  value="cancelled"
                  className={isRTL ? "text-right" : "text-left"}
                >
                  {t("manageBookings.statusCancelled")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t("manageBookings.loading")}
              </p>
            </div>
          ) : filteredBookings.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t("manageBookings.customer")}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t("manageBookings.car")}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t("manageBookings.dates")}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t("manageBookings.duration")}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t("manageBookings.total")}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t("manageBookings.status")}
                    </TableHead>
                    <TableHead className={isRTL ? "text-left" : "text-right"}>
                      {t("manageBookings.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const start = new Date(booking.startDate);
                    const end = new Date(booking.endDate);
                    const days = Math.ceil(
                      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
                    );
                    const user =
                      typeof booking.user !== "string" ? booking.user : null;

                    return (
                      <TableRow key={booking._id}>
                        <TableCell>
                          {user && (
                            <div
                              className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p
                                  className={`font-medium ${isRTL ? "text-right" : "text-left"}`}
                                >
                                  {user.name}
                                </p>
                                <p
                                  className={`text-xs text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
                                >
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div
                            className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                              <img
                                src={
                                  booking.car?.images?.[0]?.url ||
                                  "/placeholder-car.jpg"
                                }
                                alt={booking.car?.name}
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
                                className={`text-xs text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
                              >
                                {booking.car?.licensePlate}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div
                              className={`flex items-center gap-1 text-sm ${isRTL ? "flex-row-reverse" : ""}`}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>
                                {formatDate(start)} - {formatDate(end)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {t("manageBookings.daysCount", { count: days })}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
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
                          <div
                            className={`flex items-center gap-2 ${isRTL ? "justify-end" : "justify-start"}`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/bookings/${booking._id}`)
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Select
                              value=""
                              onValueChange={(value) => {
                                setSelectedBooking(booking);
                                setNewStatus(value);
                                setIsStatusDialogOpen(true);
                              }}
                            >
                              <SelectTrigger className="w-25">
                                <SelectValue
                                  placeholder={t("manageBookings.update")}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className={
                                      isRTL ? "text-right" : "text-left"
                                    }
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {pagination.totalPages > 1 && (
                <div className="p-4 border-t">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) =>
                      fetchAllBookings(page, itemsPerPage)
                    }
                  />
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery
                  ? t("manageBookings.noSearchResults")
                  : t("manageBookings.noBookingsFound")}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? t("manageBookings.noResultsForQuery", {
                      query: searchQuery,
                    })
                  : t("manageBookings.noBookingsDescription")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={isRTL ? "text-right" : "text-left"}>
              {t("manageBookings.updateStatusTitle")}
            </DialogTitle>
            <DialogDescription className={isRTL ? "text-right" : "text-left"}>
              {t("manageBookings.updateStatusDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={`${isRTL ? "text-right" : "text-left"} block`}>
                {t("manageBookings.newStatus")}
              </Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className={isRTL ? "text-right" : "text-left"}>
                  <SelectValue
                    placeholder={t("manageBookings.selectNewStatus")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={isRTL ? "text-right" : "text-left"}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="note"
                className={`${isRTL ? "text-right" : "text-left"} block`}
              >
                {t("manageBookings.noteOptional")}
              </Label>
              <Textarea
                id="note"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder={t("manageBookings.notePlaceholder")}
                className={isRTL ? "text-right" : "text-left"}
              />
            </div>
          </div>
          <DialogFooter
            className={isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""}
          >
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              {t("manageBookings.common.cancel")}
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={!newStatus}
              className={isRTL ? "mr-2 sm:mr-0 sm:ml-2" : ""}
            >
              {t("manageBookings.updateStatus")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ManageBookingsPage;
