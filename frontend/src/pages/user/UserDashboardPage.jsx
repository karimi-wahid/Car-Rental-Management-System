import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  AlertCircle,
  Plus,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import useBookingStore from "@/store/bookingStore";
import { BookingCard } from "@/components/user/BookingCard";
import { useTranslation } from "react-i18next";

const UserDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { fetchUserHistoryBookings, loading, error } = useBookingStore();
  const isRTL = i18n.language !== "en";

  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  let isLoading = loading;
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    upcomingTrips: 0,
    completedTrips: 0,
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return {
          variant: "default",
          label: t("userDashboard.statusConfirmed"),
          icon: CheckCircle,
        };
      case "completed":
        return {
          variant: "secondary",
          label: t("userDashboard.statusCompleted"),
          icon: CheckCircle,
        };
      case "cancelled":
        return {
          variant: "destructive",
          label: t("userDashboard.statusCancelled"),
          icon: AlertCircle,
        };
      case "pending":
        return {
          variant: "outline",
          label: t("userDashboard.statusPending"),
          icon: Clock,
        };
      default:
        return { variant: "outline", label: status, icon: AlertCircle };
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchUserHistoryBookings({ page: 1, limit: 5 });
        const { summary, upcomingBookings, recentBookings } = res.data;

        setUpcomingBookings(upcomingBookings);
        setRecentBookings(recentBookings);
        setStats({
          totalBookings: summary.totalBookings,
          totalSpent: summary.totalSpent,
          upcomingTrips: summary.upcomingTrips,
          completedTrips: summary.completedTrips,
        });
      } catch (err) {
        toast.error(error || t("userDashboard.errorLoadingDashboard"));
        console.log(err);
      }
    };

    loadDashboard();
  }, [fetchUserHistoryBookings, t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <PageHeader
        title={t("userDashboard.welcomeMessage", {
          name: user?.name || t("userDashboard.user"),
        })}
        description={t("userDashboard.dashboardDescription")}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div
                className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="outline">{t("userDashboard.total")}</Badge>
              </div>
              <h3
                className={`text-3xl font-bold ${isRTL ? "text-right" : "text-left"}`}
              >
                {formatNumber(stats.totalBookings)}
              </h3>
              <p
                className={`text-sm text-muted-foreground mt-1 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("userDashboard.totalBookings")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div
                className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <Badge variant="outline">{t("userDashboard.cost")}</Badge>
              </div>
              <h3
                className={`text-xl font-bold ${isRTL ? "text-right" : "text-left"}`}
              >
                {formatCurrency(stats.totalSpent)}
              </h3>
              <p
                className={`text-sm text-muted-foreground mt-1 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("userDashboard.totalSpent")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div
                className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <Badge variant="outline">{t("userDashboard.upcoming")}</Badge>
              </div>
              <h3
                className={`text-3xl font-bold ${isRTL ? "text-right" : "text-left"}`}
              >
                {formatNumber(stats.upcomingTrips)}
              </h3>
              <p
                className={`text-sm text-muted-foreground mt-1 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("userDashboard.upcomingTrips")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div
                className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
                <Badge variant="outline">{t("userDashboard.completed")}</Badge>
              </div>
              <h3
                className={`text-3xl font-bold ${isRTL ? "text-right" : "text-left"}`}
              >
                {formatNumber(stats.completedTrips)}
              </h3>
              <p
                className={`text-sm text-muted-foreground mt-1 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("userDashboard.completedTrips")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="mb-8">
        <div
          className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <Button
            onClick={() => {
              navigate("/cars");
              window.scrollTo(0, 0);
            }}
            size="lg"
          >
            <Plus className={`ml-2 h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            {t("userDashboard.bookNewCar")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              navigate("/bookings");
              window.scrollTo(0, 0);
            }}
            size="lg"
          >
            <Calendar className={`ml-2 h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            {t("userDashboard.viewAllBookings")}
          </Button>
        </div>
      </motion.div>

      {/* Upcoming Bookings */}
      <motion.div variants={itemVariants} className="mb-8">
        <div
          className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <h2 className="text-xl font-semibold">
            {t("userDashboard.upcomingTripsTitle")}
          </h2>
          <Button
            variant="ghost"
            onClick={() => {
              navigate("/bookings");
              window.scrollTo(0, 0);
            }}
          >
            {t("userDashboard.viewAll")}
            <ArrowLeft className={`mr-2 h-4 w-4 ${isRTL ? "mr-2" : "ml-2"}`} />
          </Button>
        </div>

        {isLoading ? (
          <Card className="p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </Card>
        ) : upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("userDashboard.noUpcomingTrips")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("userDashboard.noUpcomingTripsDescription")}
            </p>
            <Button onClick={() => navigate("/cars")} size="lg">
              {t("userDashboard.viewCars")}
            </Button>
          </Card>
        )}
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <div
          className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <h2 className="text-xl font-semibold">
            {t("userDashboard.recentActivity")}
          </h2>
          <Button
            variant="ghost"
            onClick={() => {
              navigate("/bookings/history");
              window.scrollTo(0, 0);
            }}
          >
            {t("userDashboard.viewHistory")}
            <ArrowLeft className={`mr-2 h-4 w-4 ${isRTL ? "mr-2" : "ml-2"}`} />
          </Button>
        </div>

        {isLoading ? (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </Card>
        ) : recentBookings.length > 0 ? (
          <div className="space-y-4">
            {recentBookings.map((booking) => {
              const statusInfo = getStatusBadge(booking.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Card
                  key={booking._id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    navigate(`/bookings/${booking._id}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <CardContent className="p-4">
                    <div
                      className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={
                              booking.car?.images?.[0]?.url ||
                              "/placeholder-car.jpg"
                            }
                            alt={booking.car?.name || t("userDashboard.car")}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className={isRTL ? "text-right" : "text-left"}>
                          <h4 className="font-semibold text-lg">
                            {booking.car?.name || t("userDashboard.carName")}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(booking.startDate)} -{" "}
                            {formatDate(booking.endDate)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("userDashboard.bookingId")}:{" "}
                            {booking._id?.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-left ${isRTL ? "text-right" : "text-left"}`}
                      >
                        <Badge variant={statusInfo.variant} className="mb-2">
                          <StatusIcon className="ml-1 h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(booking.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("userDashboard.noRecentActivity")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("userDashboard.noRecentActivityDescription")}
            </p>
            <Button
              onClick={() => {
                navigate("/cars");
                window.scrollTo(0, 0);
              }}
              size="lg"
            >
              {t("userDashboard.bookFirstCar")}
            </Button>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
};

export default UserDashboardPage;
