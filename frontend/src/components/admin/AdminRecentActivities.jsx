import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const AdminRecentActivities = ({ recentActivities, getActivityIcon }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language !== "en";

  const hasActivities = recentActivities && recentActivities.length > 0;

  return (
    <div>
      <div
        className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <h2 className="text-xl font-semibold">
          {t("adminRecentActivities.title")}
        </h2>
        <Button variant="ghost" onClick={() => navigate("/admin/activities")}>
          {t("adminRecentActivities.viewAll")}
          <ArrowLeft className={`${isRTL ? "mr-2" : "ml-2"} h-4 w-4`} />
        </Button>
      </div>

      {hasActivities ? (
        <Card>
          <CardContent className="p-0">
            {recentActivities.map((activity, index) => {
              const {
                icon: Icon,
                color,
                label,
              } = getActivityIcon(activity.type);
              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className={`p-2 rounded-full shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {activity.description ||
                        label ||
                        t("adminRecentActivities.activityOccurred")}
                    </p>
                    <p
                      className={`text-sm text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                  {activity.amount && (
                    <Badge variant="outline" className="font-mono shrink-0">
                      {formatCurrency(activity.amount)}
                    </Badge>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t("adminRecentActivities.noActivitiesTitle")}
          </h3>
          <p className="text-muted-foreground">
            {t("adminRecentActivities.noActivitiesDescription")}
          </p>
        </Card>
      )}
    </div>
  );
};

export default AdminRecentActivities;
