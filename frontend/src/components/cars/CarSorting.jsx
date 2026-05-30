import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export const CarSorting = ({ value, order, onSortChange }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  const getSelectValue = () => {
    const sortValue = value || "createdAt";
    const sortOrder = order || "desc";

    const cleanValue = sortValue.startsWith("-")
      ? sortValue.substring(1)
      : sortValue;
    return `${cleanValue}-${sortOrder}`;
  };

  const handleSortChange = (newValue) => {
    const [sortBy, sortOrder] = newValue.split("-");
    onSortChange(sortBy, sortOrder);
  };

  return (
    <div
      className={`flex items-center ${isRTL ? "space-x-4 space-x-reverse" : "space-x-4"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Label
        htmlFor="sort"
        className={`text-sm font-medium whitespace-nowrap px-2 ${isRTL ? "text-left" : "text-left"}`}
      >
        {t("carSorting.sortBy")} :
      </Label>
      <Select value={getSelectValue()} onValueChange={handleSortChange}>
        <SelectTrigger
          id="sort"
          className={`w-50 ${isRTL ? "text-right" : "text-left"}`}
        >
          <SelectValue placeholder={t("carSorting.sortBy")} />
        </SelectTrigger>
        <SelectContent className="cursor-pointer">
          <SelectItem
            value="createdAt-desc"
            className={isRTL ? "text-right" : "text-left"}
          >
            {t("carSorting.newestFirst")}
          </SelectItem>
          <SelectItem
            value="createdAt-asc"
            className={isRTL ? "text-right" : "text-left"}
          >
            {t("carSorting.oldestFirst")}
          </SelectItem>
          <SelectItem
            value="pricePerDay-asc"
            className={isRTL ? "text-right" : "text-left"}
          >
            {t("carSorting.priceLowToHigh")}
          </SelectItem>
          <SelectItem
            value="pricePerDay-desc"
            className={isRTL ? "text-right" : "text-left"}
          >
            {t("carSorting.priceHighToLow")}
          </SelectItem>
          <SelectItem
            value="name-asc"
            className={isRTL ? "text-right" : "text-left"}
          >
            {t("carSorting.nameAscending")}
          </SelectItem>
          <SelectItem
            value="name-desc"
            className={isRTL ? "text-right" : "text-left"}
          >
            {t("carSorting.nameDescending")}
          </SelectItem>
          <SelectItem
            value="year-desc"
            className={isRTL ? "text-right" : "text-left"}
          >
            {t("carSorting.yearNewestFirst")}
          </SelectItem>
          <SelectItem
            value="year-asc"
            className={isRTL ? "text-right" : "text-left"}
          >
            {t("carSorting.yearOldestFirst")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
