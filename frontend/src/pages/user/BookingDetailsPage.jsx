import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { format } from "date-fns";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Car,
  CreditCard,
  FileText,
  AlertCircle,
  Download,
  MessageCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, cn, formatDate } from "@/lib/utils";
import { toast } from "react-hot-toast";
import useBookingStore from "@/store/bookingStore";
import { BookingInvoice } from "@/components/common/BookingInvoice";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "react-i18next";

const BookingDetailsPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const booking = useBookingStore((state) => state.selectedBooking);
  const loading = useBookingStore((state) => state.loading);
  const { fetchBookingById, cancelBooking, error } = useBookingStore();
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const isRTL = i18n.language !== "en";

  const fetchBookingDetails = useCallback(async () => {
    if (!id) return;

    try {
      await fetchBookingById(id);
    } catch (err) {
      toast.error(error || t("bookingDetails.loadError"));
      console.log(err);
      navigate("/bookings");
    }
  }, [id, navigate, fetchBookingById, error, t]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  const handleCancelBooking = async () => {
    if (!id || !cancellationReason) return;

    setIsCancelling(true);
    try {
      await cancelBooking(id, cancellationReason);
      toast.success(t("bookingDetails.cancelSuccess"));
      fetchBookingDetails();
    } catch (err) {
      toast.error(t("bookingDetails.cancelError"));
      console.log(err);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleContactSupport = () => {
    navigate("/contact", { state: { bookingId: id } });
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return t("bookingDetails.statusConfirmed");
      case "pending":
        return t("bookingDetails.statusPending");
      case "cancelled":
        return t("bookingDetails.statusCancelled");
      case "completed":
        return t("bookingDetails.statusCompleted");
      default:
        return status;
    }
  };

  const getTransmissionText = (transmission) => {
    return t(`transmission.${transmission}`, transmission);
  };

  const getFuelTypeText = (fuelType) => {
    return t(`fuel.${fuelType}`, fuelType);
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case "confirmed":
        return "border-r-green-500";
      case "pending":
        return "border-r-yellow-500";
      case "cancelled":
        return "border-r-red-500";
      case "completed":
        return "border-r-blue-500";
      default:
        return "";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-100 flex items-center justify-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t("bookingDetails.loading")}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div
        className="min-h-100 flex items-center justify-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {t("bookingDetails.notFound")}
          </h2>
          <p className="text-muted-foreground mb-4">
            {t("bookingDetails.notFoundDescription")}
          </p>
          <Button
            onClick={() => {
              navigate("/bookings");
              scrollTo(0, 0);
            }}
          >
            {t("bookingDetails.backToBookings")}
          </Button>
        </Card>
      </div>
    );
  }

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const daysCount = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between mb-6 ${isRTL ? "" : "flex-row-reverse"}`}
      >
        <Button
          variant="ghost"
          onClick={() => {
            navigate("/bookings");
            scrollTo(0, 0);
          }}
          className="gap-2"
        >
          <ArrowRight className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
          {t("bookingDetails.backToBookings")}
        </Button>

        <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          {booking.status === "confirmed" && user?.role === "admin" && (
            <Button onClick={() => setShowInvoice(true)}>
              <Download className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("bookingDetails.downloadInvoice")}
            </Button>
          )}
          {showInvoice && (
            <BookingInvoice
              booking={booking}
              onClose={() => setShowInvoice(false)}
            />
          )}
          <Button variant="outline" size="sm" onClick={handleContactSupport}>
            <MessageCircle className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            {t("bookingDetails.support")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          <Card
            className={cn("border-r-4", getStatusBorderColor(booking.status))}
          >
            <CardContent className="p-6">
              <div
                className={`flex items-center justify-between ${isRTL ? "" : "flex-row-reverse"}`}
              >
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("bookingDetails.bookingStatus")}
                  </p>
                  <h2 className="text-2xl font-bold">
                    {getStatusText(booking.status)}
                  </h2>
                </div>
                <Badge
                  className={cn(
                    "px-4 py-2",
                    getStatusBadgeColor(booking.status),
                  )}
                >
                  {t("bookingDetails.bookingNumber")} #
                  {booking._id.slice(-6).toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Car Details */}
          <Card>
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${isRTL ? "" : "flex-row-reverse"}`}
              >
                <Car className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("bookingDetails.carDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex gap-6 ${isRTL ? "" : "flex-row-reverse"}`}>
                <div className="w-48 h-32 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={booking.car.images?.[0]?.url || "/placeholder-car.jpg"}
                    alt={booking.car.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h3 className="text-2xl font-bold mb-1">
                    {booking.car.name}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {booking.car.brand} {booking.car.carModel} •{" "}
                    {booking.car.year}
                  </p>
                  <div
                    className={`flex flex-wrap gap-2 ${isRTL ? "justify-start" : "justify-end"}`}
                  >
                    <Badge variant="outline">
                      {getTransmissionText(booking.car.transmission)}
                    </Badge>
                    <Badge variant="outline">
                      {getFuelTypeText(booking.car.fuelType)}
                    </Badge>
                    <Badge variant="outline">
                      {t("bookingDetails.seatsCount", {
                        count: booking.car.seats,
                      })}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rental Details */}
          <Card>
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${isRTL ? "" : "flex-row-reverse"}`}
              >
                <Calendar className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("bookingDetails.rentalDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("bookingDetails.startDate")}
                  </p>
                  <p className="font-semibold">{formatDate(startDate)}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(startDate, "HH:mm")}
                  </p>
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("bookingDetails.endDate")}
                  </p>
                  <p className="font-semibold">{formatDate(endDate)}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(endDate, "HH:mm")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${isRTL ? "" : "flex-row-reverse"}`}
              >
                <CreditCard className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("bookingDetails.priceSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`flex justify-between ${isRTL ? "" : "flex-row-reverse"}`}
              >
                <span>
                  {formatCurrency(booking.car.pricePerDay * daysCount)}
                </span>
                <span className="text-muted-foreground">
                  {formatCurrency(booking.car.pricePerDay)} ×{" "}
                  {t("bookingDetails.daysCount", { count: daysCount })}
                </span>
              </div>

              <Separator />

              <div
                className={`flex justify-between font-bold ${isRTL ? "" : "flex-row-reverse"}`}
              >
                <span className="text-primary">
                  {formatCurrency(booking.totalPrice)}
                </span>
                <span>{t("bookingDetails.total")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Card>
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${isRTL ? "" : "flex-row-reverse"}`}
              >
                <FileText className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("bookingDetails.cancellationPolicy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li
                  className={`flex items-start gap-2 ${isRTL ? "" : "flex-row-reverse"}`}
                >
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className={isRTL ? "text-right" : "text-left"}>
                    {t("bookingDetails.freeCancellation")}
                  </span>
                </li>
                <li
                  className={`flex items-start gap-2 ${isRTL ? "" : "flex-row-reverse"}`}
                >
                  <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className={isRTL ? "text-right" : "text-left"}>
                    {t("bookingDetails.partialRefund")}
                  </span>
                </li>
                <li
                  className={`flex items-start gap-2 ${isRTL ? "" : "flex-row-reverse"}`}
                >
                  <XCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className={isRTL ? "text-right" : "text-left"}>
                    {t("bookingDetails.noRefund")}
                  </span>
                </li>
              </ul>

              {booking.status === "confirmed" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full mt-4">
                      {t("bookingDetails.cancelBooking")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
                    <AlertDialogHeader>
                      <AlertDialogTitle
                        className={isRTL ? "text-right" : "text-left"}
                      >
                        {t("bookingDetails.cancelConfirmTitle")}
                      </AlertDialogTitle>
                      <AlertDialogDescription
                        className={isRTL ? "text-right" : "text-left"}
                      >
                        {t("bookingDetails.cancelConfirmDescription")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Textarea
                        placeholder={t(
                          "bookingDetails.cancelReasonPlaceholder",
                        )}
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        className={isRTL ? "text-right" : "text-left"}
                      />
                    </div>
                    <AlertDialogFooter
                      className={
                        isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""
                      }
                    >
                      <AlertDialogCancel>
                        {t("bookingDetails.keepBooking")}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelBooking}
                        disabled={!cancellationReason || isCancelling}
                        className={`bg-destructive hover:bg-destructive/90 ${isRTL ? "mr-2 sm:mr-0 sm:ml-2" : ""}`}
                      >
                        {isCancelling
                          ? t("bookingDetails.cancelling")
                          : t("bookingDetails.confirmCancel")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingDetailsPage;
