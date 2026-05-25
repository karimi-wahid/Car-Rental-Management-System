import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

// Custom tooltip for revenue chart
const CustomTooltip = ({ active, payload, label }) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-1">{label}</p>
        <p className="text-lg font-bold text-primary">
          {formatCurrency(payload[0].value)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t("adminCharts.revenue")}
        </p>
      </div>
    );
  }
  return null;
};

// Custom label for pie chart
const renderPieLabel = ({ name, percent }) => {
  const percentage = (percent * 100).toFixed(0);
  return `${name} (${percentage}%)`;
};

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-1">{data.name}</p>
        <p className="text-lg font-bold">{data.value}</p>
        <p className="text-xs text-muted-foreground">
          {t("adminCharts.revenue")}: {formatCurrency(data.revenue)}
        </p>
      </div>
    );
  }
  return null;
};

const AdminChartsSection = ({ revenueData, statusData }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle
            className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <span>{t("adminCharts.revenueOverview")}</span>
            <Button variant="ghost" size="sm">
              <Eye className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("adminCharts.details")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenue)"
                  name={t("adminCharts.revenue")}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          {revenueData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  {t("adminCharts.totalRevenue")}
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(
                    revenueData.reduce((sum, item) => sum + item.revenue, 0),
                  )}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  {t("adminCharts.averageMonthly")}
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(
                    revenueData.reduce((sum, item) => sum + item.revenue, 0) /
                      revenueData.length,
                  )}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? "text-right" : "text-left"}>
            {t("adminCharts.bookingStatusDistribution")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 &&
          statusData.some((item) => item.value > 0) ? (
            <>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={renderPieLabel}
                      labelLine={true}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Status Legend with detailed stats */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {statusData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{item.value}</span>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total bookings summary */}
              <div className="mt-4 pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground">
                  {t("adminCharts.totalBookings")}:{" "}
                  {statusData.reduce((sum, item) => sum + item.value, 0)}
                </p>
              </div>
            </>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-muted-foreground">
                {t("adminCharts.noDataAvailable")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChartsSection;
