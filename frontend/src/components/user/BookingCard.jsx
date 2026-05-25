import { useNavigate } from "react-router-dom";
import { differenceInDays, isWithinInterval } from "date-fns";
import {
  Calendar,
  MoreVertical,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useState } from "react";
import { formatCurrency, cn, formatDate } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export const BookingCard = ({ booking, onCancel, onViewDetails, onModify }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const isRTL = i18n.language !== "en";

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const today = new Date();
  const daysUntilStart = differenceInDays(startDate, today);
  const isUpcoming = daysUntilStart > 0;
  const isOngoing = isWithinInterval(today, { start: startDate, end: endDate });
  const isPast = today > endDate;

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: t("bookingCard.statusPending"),
        variant: "warning",
        color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        icon: Clock,
      },
      confirmed: {
        label: t("bookingCard.statusConfirmed"),
        variant: "default",
        color: "bg-green-500/10 text-green-600 border-green-500/20",
        icon: CheckCircle,
      },
      active: {
        label: t("bookingCard.statusActive"),
        variant: "default",
        color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        icon: Calendar,
      },
      completed: {
        label: t("bookingCard.statusCompleted"),
        variant: "secondary",
        color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
        icon: CheckCircle,
      },
      cancelled: {
        label: t("bookingCard.statusCancelled"),
        variant: "destructive",
        color: "bg-red-500/10 text-red-600 border-red-500/20",
        icon: XCircle,
      },
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  // Determine if actions are available
  const canCancel =
    ["pending", "confirmed"].includes(booking.status) && isUpcoming;
  const canModify =
    ["pending", "confirmed"].includes(booking.status) &&
    isUpcoming &&
    daysUntilStart > 2;
  const canViewInvoice = ["confirmed", "active", "completed"].includes(
    booking.status,
  );

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(booking._id);
    } else {
      navigate(`/bookings/${booking.car._id}`);
    }
  };

  const handleModify = () => {
    if (onModify) {
      onModify(booking._id);
    } else {
      navigate(`/bookings/${booking._id}/modify`);
    }
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    if (onCancel) {
      onCancel(booking._id);
    }
    setShowCancelDialog(false);
  };

  const handleContactSupport = () => {
    navigate("/contact", { state: { bookingId: booking._id } });
  };

  const getTimelineBadge = () => {
    if (isUpcoming) {
      return `${daysUntilStart} ${t("bookingCard.daysLeft")}`;
    }
    if (isOngoing) {
      return t("bookingCard.ongoing");
    }
    if (isPast && booking.status === "completed") {
      return t("bookingCard.completed");
    }
    return null;
  };

  const timelineBadgeText = getTimelineBadge();

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        {/* Image Section */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={booking.car?.images?.[0]?.url || "/placeholder-car.jpg"}
            alt={booking.car?.name || t("bookingCard.car")}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

          {/* Status Badge */}
          <Badge
            className={cn(
              "absolute top-3 px-3 py-1 gap-1",
              isRTL ? "left-3" : "right-3",
              statusConfig.color,
            )}
          >
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </Badge>

          {/* Booking ID */}
          <div className={`absolute top-3 ${isRTL ? "right-3" : "left-3"}`}>
            <Badge
              variant="secondary"
              className="bg-black/50 backdrop-blur text-white border-0"
            >
              #{booking._id?.slice(-6).toUpperCase()}
            </Badge>
          </div>

          {/* Car Info */}
          <div
            className={`absolute bottom-3 ${isRTL ? "right-3" : "left-3"} text-white`}
          >
            <h3 className="font-semibold text-lg">
              {booking.car?.name || t("bookingCard.carName")}
            </h3>
            <p className="text-sm opacity-90">
              {booking.car?.brand} {booking.car?.carModel} • {booking.car?.year}
            </p>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Date Range and Status */}
          <div
            className={`flex items-center justify-between mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex items-center text-sm ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <Calendar
                className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} text-muted-foreground`}
              />
              <span>
                {formatDate(startDate)} - {formatDate(endDate)}
              </span>
            </div>

            {/* Timeline Badge */}
            {timelineBadgeText && (
              <Badge variant="outline" className="text-xs">
                {timelineBadgeText}
              </Badge>
            )}
          </div>

          {/* Duration */}
          <div
            className={`flex items-center mb-2 text-sm ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Clock
              className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} text-muted-foreground`}
            />
            <span>
              {t("bookingCard.durationDays", {
                days: booking.days || differenceInDays(endDate, startDate),
              })}
            </span>
          </div>

          {/* Payment Status */}
          {booking.paymentStatus && (
            <div
              className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <Badge
                variant={
                  booking.paymentStatus === "paid" ? "default" : "secondary"
                }
                className="text-xs"
              >
                {booking.paymentStatus === "paid"
                  ? t("bookingCard.paid")
                  : t("bookingCard.pendingPayment")}
              </Badge>
            </div>
          )}

          {/* Price and Actions */}
          <div
            className={`flex items-center justify-between pt-3 border-t ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-xs text-muted-foreground">
                {t("bookingCard.totalAmount")}
              </p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(booking.totalPrice)}
              </p>
            </div>

            {/* Actions */}
            <div
              className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <Button variant="outline" size="sm" onClick={handleViewDetails}>
                {t("bookingCard.details")}
              </Button>

              {(canCancel || canModify || canViewInvoice) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? "end" : "start"}>
                    {canModify && (
                      <DropdownMenuItem
                        onClick={handleModify}
                        className={isRTL ? "flex-row-reverse" : ""}
                      >
                        <Edit
                          className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`}
                        />
                        {t("bookingCard.modifyBooking")}
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={handleContactSupport}
                      className={isRTL ? "flex-row-reverse" : ""}
                    >
                      <Phone className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("bookingCard.contactSupport")}
                    </DropdownMenuItem>

                    {canCancel && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleCancelClick}
                          className={`text-destructive hover:text-destructive ${isRTL ? "flex-row-reverse" : ""}`}
                        >
                          <XCircle
                            className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`}
                          />
                          {t("bookingCard.cancelBooking")}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Warning for upcoming booking */}
          {canModify && daysUntilStart <= 2 && (
            <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-xs text-yellow-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {t("bookingCard.lessThan48HoursWarning")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isRTL ? "text-right" : "text-left"}>
              {t("bookingCard.cancelConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("bookingCard.cancelConfirmDescription")}
              {daysUntilStart <= 2 && (
                <span className="block mt-2 text-destructive">
                  {t("bookingCard.cancelFeeWarning")}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRTL ? "flex-row-reverse" : ""}>
            <AlertDialogCancel>{t("bookingCard.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t("bookingCard.confirmCancel")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
