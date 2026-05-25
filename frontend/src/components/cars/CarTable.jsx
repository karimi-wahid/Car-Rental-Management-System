import { Car, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import CarTableRow from "./CarTableRow";
import { useTranslation } from "react-i18next";

const CarTable = ({
  cars,
  loading,
  pagination,
  searchQuery,
  onEdit,
  onView,
  onToggleAvailability,
  onDelete,
  onPageChange,
  onAddCar,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t("carTable.loading")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cars.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="p-12 text-center">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery
                ? t("carTable.noSearchResults")
                : t("carTable.noCarsFound")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? t("carTable.noResultsForQuery", { query: searchQuery })
                : t("carTable.noCarsDescription")}
            </p>
            <Button onClick={onAddCar}>
              <Plus className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("carTable.addFirstCar")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={isRTL ? "text-right" : "text-left"}>
                {t("carTable.car")}
              </TableHead>
              <TableHead className={isRTL ? "text-right" : "text-left"}>
                {t("carTable.details")}
              </TableHead>
              <TableHead className={isRTL ? "text-right" : "text-left"}>
                {t("carTable.price")}
              </TableHead>
              <TableHead className={isRTL ? "text-right" : "text-left"}>
                {t("carTable.status")}
              </TableHead>
              <TableHead className={isRTL ? "text-left" : "text-right"}>
                {t("carTable.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.map((car) => (
              <CarTableRow
                key={car._id}
                car={car}
                onEdit={onEdit}
                onView={onView}
                onToggleAvailability={onToggleAvailability}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>

        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={pagination.page || pagination.currentPage}
              totalPages={pagination.pages || pagination.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CarTable;
