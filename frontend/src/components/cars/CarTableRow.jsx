import { Users, Fuel, Gauge, CheckCircle, XCircle } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import CarActionsDropdown from "./CarActionsDropdown";
import { useTranslation } from "react-i18next";

const CarTableRow = ({
  car,
  onEdit,
  onView,
  onToggleAvailability,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  const getFuelTypeLabel = (fuelType) => {
    return t(`fuel.${fuelType}`, fuelType);
  };

  const getTransmissionLabel = (transmission) => {
    return t(`transmission.${transmission}`, transmission);
  };

  return (
    <TableRow>
      <TableCell>
        <div
          className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
            <img
              src={car.images?.[0]?.url || "/placeholder-car.jpg"}
              alt={car.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className={`font-medium ${isRTL ? "text-right" : "text-left"}`}>
              {car.name}
            </p>
            <p
              className={`text-sm text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
            >
              {car.brand} {car.carModel} • {car.year}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div
          className={`flex flex-wrap gap-2 ${isRTL ? "justify-end" : "justify-start"}`}
        >
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Users className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />
            {t("carTable.seatsCount", { count: car.seats })}
          </Badge>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Fuel className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />
            {getFuelTypeLabel(car.fuelType)}
          </Badge>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Gauge className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />
            {getTransmissionLabel(car.transmission)}
          </Badge>
        </div>
        <p
          className={`text-xs text-muted-foreground mt-1 ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("carTable.licensePlate")}: {car.licensePlate}
        </p>
      </TableCell>
      <TableCell
        className={`font-semibold ${isRTL ? "text-right" : "text-left"}`}
      >
        {formatCurrency(car.pricePerDay)}
        <span className="text-xs text-muted-foreground mr-1">
          {t("carTable.perDay")}
        </span>
      </TableCell>
      <TableCell>
        <div
          className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse justify-end" : "justify-start"}`}
        >
          {car.availability ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{t("carTable.available")}</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm">{t("carTable.unavailable")}</span>
            </>
          )}
        </div>
      </TableCell>
      <TableCell className={isRTL ? "text-left" : "text-right"}>
        <CarActionsDropdown
          car={car}
          onEdit={onEdit}
          onView={onView}
          onToggleAvailability={onToggleAvailability}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default CarTableRow;
