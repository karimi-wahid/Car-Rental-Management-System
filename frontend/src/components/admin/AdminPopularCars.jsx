import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const AdminPopularCars = ({ popularCars }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language !== "en";

  const hasPopularCars = popularCars && popularCars.length > 0;

  return (
    <div>
      <div
        className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <h2 className="text-xl font-semibold">{t("adminPopularCars.title")}</h2>
        <Button variant="ghost" onClick={() => navigate("/admin/cars")}>
          {t("adminPopularCars.viewAllCars")}
          <ArrowLeft className={`${isRTL ? "mr-2" : "ml-2"} h-4 w-4`} />
        </Button>
      </div>

      {hasPopularCars ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularCars.map((car, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow group cursor-pointer"
              onClick={() => navigate(`/admin/cars/${car.carDetails._id}`)}
            >
              <CardContent className="p-4">
                <div
                  className={`flex gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className="relative w-28 h-28 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={
                        car.carDetails.images?.[0]?.url ||
                        "/placeholder-car.jpg"
                      }
                      alt={car.carDetails.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div
                      className={`absolute top-2 ${isRTL ? "right-2" : "left-2"}`}
                    >
                      <Badge className="bg-black/50 backdrop-blur text-white border-0">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                      {car.carDetails.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {car.carDetails.brand} {car.carDetails.carModel}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">
                        {t("adminPopularCars.bookingsCount", {
                          count: car.bookings,
                        })}
                      </span>
                    </div>
                    <Badge variant="outline" className="w-full justify-center">
                      {formatCurrency(car.revenue)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t("adminPopularCars.noBookingsTitle")}
          </h3>
          <p className="text-muted-foreground mb-6">
            {t("adminPopularCars.noBookingsDescription")}
          </p>
          <Button variant="outline" onClick={() => navigate("/admin/cars")}>
            {t("adminPopularCars.manageCars")}
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AdminPopularCars;
