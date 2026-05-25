import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Car,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  Activity,
} from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import useBookingStore from "@/store/bookingStore";
import useCarStore from "@/store/carStore";
import useUserStore from "@/store/userStore";
import { formatCurrency, formatNumber } from "@/lib/utils";
import AdminPopularCars from "@/components/admin/AdminPopularCars";
import AdminRecentActivities from "@/components/admin/AdminRecentActivities";
import AdminChartsSection from "@/components/admin/AdminChartsSection";
import AdminStatsGrid from "@/components/admin/AdminStatsGrid";
import { PageHeader } from "@/components/common/PageHeader";
import { useTranslation } from "react-i18next";

const AdminDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { users, getAllUsers } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [timeRange] = useState("week");
  const [stats, setStats] = useState({
    overview: {
      totalUsers: 0,
      totalCars: 0,
      totalBookings: 0,
      totalRevenue: 0,
      availableCars: 0,
      occupancyRate: 0,
      avgBookingValue: 0,
      conversionRate: 0,
      newUsersToday: 0,
      pendingBookings: 0,
    },
    revenueData: [],
    bookingsByStatus: {},
    popularCars: [],
    recentActivities: [],
  });
  const { fetchAllBookings } = useBookingStore();
  const { fetchCars } = useCarStore();

  useEffect(() => {
    const getLocaleForDate = () => {
      switch (i18n.language) {
        case "fa":
          return "fa-AF";
        case "ps":
          return "ps-AF";
        default:
          return "en-US";
      }
    };

    if (!user) return;
    const loadDashboard = async () => {
      setLoading(true);
      try {
        // Fetch data in parallel
        const [bookingRes, carRes] = await Promise.all([
          fetchAllBookings(1, 100),
          fetchCars(1, 100),
        ]);
        const bookingsData = bookingRes?.data?.bookings || [];
        const carsData = carRes?.data?.cars || [];

        // ======================
        // 📊 OVERVIEW STATS
        // ======================

        const totalRevenue = bookingsData.reduce(
          (sum, b) => sum + (b.totalPrice || 0),
          0,
        );

        const pendingBookings = bookingsData.filter(
          (b) => b.status === "pending",
        ).length;

        const availableCars = carsData.filter((c) => c.availability).length;

        const occupancyRate =
          carsData.length > 0
            ? ((carsData.length - availableCars) / carsData.length) * 100
            : 0;

        // ======================
        // 📈 REVENUE CHART
        // ======================

        const revenueMap = {};
        const locale = getLocaleForDate();

        bookingsData.forEach((b) => {
          const month = new Date(b.createdAt).toLocaleDateString(locale, {
            month: "long",
          });

          if (!revenueMap[month]) {
            revenueMap[month] = 0;
          }

          revenueMap[month] += b.totalPrice || 0;
        });

        const revenueData = Object.entries(revenueMap).map(
          ([month, revenue]) => ({
            month,
            revenue,
          }),
        );

        // ======================
        // 📊 STATUS DISTRIBUTION
        // ======================

        const statusCounts = {
          pending: { count: 0, revenue: 0 },
          confirmed: { count: 0, revenue: 0 },
          completed: { count: 0, revenue: 0 },
          cancelled: { count: 0, revenue: 0 },
        };

        bookingsData.forEach((b) => {
          if (statusCounts[b.status]) {
            statusCounts[b.status].count += 1;
            statusCounts[b.status].revenue += b.totalPrice || 0;
          }
        });

        // ======================
        // 🚗 POPULAR CARS
        // ======================

        const carMap = {};

        bookingsData.forEach((b) => {
          const carId = b.car?._id;
          if (!carId) return;

          if (!carMap[carId]) {
            carMap[carId] = {
              carDetails: b.car,
              bookings: 0,
              revenue: 0,
            };
          }

          carMap[carId].bookings += 1;
          carMap[carId].revenue += b.totalPrice || 0;
        });

        const popularCars = Object.values(carMap)
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 3);

        // ======================
        // 🧾 FINAL STATE
        // ======================

        setStats({
          overview: {
            totalUsers: users.length,
            totalCars: carsData.length,
            totalBookings: bookingsData.length,
            totalRevenue,
            availableCars,
            occupancyRate: Math.round(occupancyRate),
            avgBookingValue:
              bookingsData.length > 0 ? totalRevenue / bookingsData.length : 0,
            conversionRate: 0,
            newUsersToday: 0,
            pendingBookings,
          },
          revenueData,
          bookingsByStatus: statusCounts,
          popularCars,
          recentActivities: [],
        });
      } catch (error) {
        console.error(error);
        toast.error(error || t("adminDashboard.errorLoadingData"));
      } finally {
        setLoading(false);
      }
    };

    getAllUsers();

    loadDashboard();
  }, [
    timeRange,
    fetchAllBookings,
    fetchCars,
    user,
    getAllUsers,
    users.length,
    t,
    i18n.language,
  ]);

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return t("adminDashboard.statusPending");
      case "confirmed":
        return t("adminDashboard.statusConfirmed");
      case "completed":
        return t("adminDashboard.statusCompleted");
      case "cancelled":
        return t("adminDashboard.statusCancelled");
      default:
        return status;
    }
  };

  const statCards = [
    {
      title: t("adminDashboard.totalUsers"),
      value: formatNumber(stats.overview?.totalUsers),
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      subtitle: t("adminDashboard.newUsersToday", {
        count: stats.overview?.newUsersToday || 0,
      }),
    },
    {
      title: t("adminDashboard.totalCars"),
      value: formatNumber(stats.overview.totalCars),
      icon: Car,
      color: "from-purple-500 to-pink-500",
      subtitle: t("adminDashboard.availableCars", {
        count: stats.overview.availableCars,
      }),
    },
    {
      title: t("adminDashboard.totalBookings"),
      value: formatNumber(stats.overview.totalBookings),
      icon: Calendar,
      color: "from-green-500 to-emerald-500",
      subtitle: t("adminDashboard.pendingBookings", {
        count: stats.overview.pendingBookings,
      }),
    },
    {
      title: t("adminDashboard.totalRevenue"),
      value: formatCurrency(stats.overview.totalRevenue),
      icon: DollarSign,
      color: "from-orange-500 to-red-500",
      subtitle: t("adminDashboard.averageBookingValue", {
        value: formatCurrency(stats.overview.avgBookingValue),
      }),
    },
  ];

  const statusData = Object.entries(stats.bookingsByStatus).map(
    ([status, data]) => ({
      name: getStatusLabel(status),
      value: data.count,
      revenue: data.revenue,
      originalStatus: status,
    }),
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case "user_created":
        return {
          icon: Users,
          color:
            "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        };
      case "booking_created":
        return {
          icon: Calendar,
          color:
            "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        };
      case "payment_received":
        return {
          icon: DollarSign,
          color:
            "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
        };
      case "car_added":
        return {
          icon: Car,
          color:
            "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        };
      case "booking_completed":
        return {
          icon: CheckCircle,
          color:
            "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
        };
      default:
        return {
          icon: Activity,
          color:
            "bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            {t("pageLoader.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title={t("adminDashboard.dashboardTitle")}
          description={t("adminDashboard.welcomeMessage", {
            name: user?.name || t("adminDashboard.admin"),
          })}
        />
      </div>
      {/* Stats Grid */}
      <AdminStatsGrid statCards={statCards} />

      {/* Charts Section */}
      <AdminChartsSection
        revenueData={stats.revenueData}
        statusData={statusData}
      />

      {/* Popular Cars */}
      <AdminPopularCars popularCar={stats.popularCars} />

      {/* Recent Activities */}
      <AdminRecentActivities
        recentActivities={stats.recentActivities}
        getActivityIcon={getActivityIcon}
      />
    </motion.div>
  );
};

export default AdminDashboardPage;
