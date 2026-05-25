import { Search, Filter, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

const CarFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  return (
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
              placeholder={t("carFilter.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${isRTL ? "pr-9 text-right" : "pl-9 text-left"}`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors`}
                aria-label={t("carFilter.clearSearch")}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-37.5">
              <Filter className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              <SelectValue placeholder={t("carFilter.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className={isRTL ? "text-right" : "text-left"}
              >
                {t("carFilter.allCars")}
              </SelectItem>
              <SelectItem
                value="available"
                className={isRTL ? "text-right" : "text-left"}
              >
                {t("carFilter.available")}
              </SelectItem>
              <SelectItem
                value="unavailable"
                className={isRTL ? "text-right" : "text-left"}
              >
                {t("carFilter.unavailable")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarFilters;
