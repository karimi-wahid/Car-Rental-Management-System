import { useState } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";
import useCarStore from "@/store/carStore";
import { useTranslation } from "react-i18next";

const FilterContent = ({
  filters,
  brands,
  priceRange,
  activeFiltersCount,
  handleFilterChange,
  handlePriceChange,
  clearFilters,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Search */}
      <div>
        <Label
          htmlFor="search"
          className={`text-sm font-medium mb-2 block ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("carFilters.search")}
        </Label>
        <div className="relative">
          <Search
            className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`}
          />
          <Input
            id="search"
            placeholder={t("carFilters.searchPlaceholder")}
            className={`${isRTL ? "pr-9 text-right" : "pl-9 text-left"}`}
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Brand Filter */}
      <div>
        <Label
          htmlFor="brand"
          className={`text-sm font-medium mb-2 block ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("carFilters.brand")}
        </Label>
        <Select
          value={filters.brand || "all"}
          onValueChange={(value) => handleFilterChange("brand", value)}
        >
          <SelectTrigger
            id="brand"
            className={isRTL ? "text-right" : "text-left"}
          >
            <SelectValue placeholder={t("carFilters.allBrands")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("carFilters.allBrands")}
            </SelectItem>
            {brands.map((brand) => (
              <SelectItem
                key={brand}
                value={brand}
                className={isRTL ? "text-right" : "text-left"}
              >
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <div
          className={`flex items-center justify-between mb-2 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <Label className="text-sm font-medium">
            {t("carFilters.priceRange")}
          </Label>
          <span className="text-sm text-muted-foreground">
            {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
          </span>
        </div>
        <Slider
          min={0}
          max={10000}
          step={1}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="mt-2"
        />
        <div
          className={`flex justify-between mt-3 text-xs text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span>{formatCurrency(0)}</span>
          <span>{formatCurrency(10000)}</span>
        </div>
      </div>

      {/* Transmission */}
      <div>
        <Label
          htmlFor="transmission"
          className={`text-sm font-medium mb-2 block ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("carFilters.transmission")}
        </Label>
        <Select
          value={filters.transmission || "all"}
          onValueChange={(value) => handleFilterChange("transmission", value)}
        >
          <SelectTrigger
            id="transmission"
            className={isRTL ? "text-right" : "text-left"}
          >
            <SelectValue placeholder={t("carFilters.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("carFilters.all")}
            </SelectItem>
            <SelectItem
              value="automatic"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("transmission.automatic")}
            </SelectItem>
            <SelectItem
              value="manual"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("transmission.manual")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fuel Type */}
      <div>
        <Label
          htmlFor="fuelType"
          className={`text-sm font-medium mb-2 block ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("carFilters.fuelType")}
        </Label>
        <Select
          value={filters.fuelType || "all"}
          onValueChange={(value) => handleFilterChange("fuelType", value)}
        >
          <SelectTrigger
            id="fuelType"
            className={isRTL ? "text-right" : "text-left"}
          >
            <SelectValue placeholder={t("carFilters.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("carFilters.all")}
            </SelectItem>
            <SelectItem
              value="petrol"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("fuel.petrol")}
            </SelectItem>
            <SelectItem
              value="diesel"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("fuel.diesel")}
            </SelectItem>
            <SelectItem
              value="electric"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("fuel.electric")}
            </SelectItem>
            <SelectItem
              value="hybrid"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("fuel.hybrid")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Seats */}
      <div>
        <Label
          htmlFor="seats"
          className={`text-sm font-medium mb-2 block ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("carFilters.seats")}
        </Label>
        <Select
          value={filters.seats || "all"}
          onValueChange={(value) => handleFilterChange("seats", value)}
        >
          <SelectTrigger
            id="seats"
            className={isRTL ? "text-right" : "text-left"}
          >
            <SelectValue placeholder={t("carFilters.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("carFilters.all")}
            </SelectItem>
            <SelectItem
              value="2"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("carFilters.seatsCount", { count: 2 })}
            </SelectItem>
            <SelectItem
              value="4"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("carFilters.seatsCount", { count: 4 })}
            </SelectItem>
            <SelectItem
              value="5"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("carFilters.seatsCount", { count: 5 })}
            </SelectItem>
            <SelectItem
              value="7"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("carFilters.seatsCount", { count: 7 })}
            </SelectItem>
            <SelectItem
              value="8"
              className={isRTL ? "text-right" : "text-left"}
            >
              {t("carFilters.seatsCountPlus", { count: 8 })}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className={`w-full text-muted-foreground hover:text-foreground ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <X className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
          {t("carFilters.clearAllFilters")} ({activeFiltersCount})
        </Button>
      )}
    </div>
  );
};

export const CarFilters = ({ onFilterChange, brands, className }) => {
  const { t, i18n } = useTranslation();
  const filters = useCarStore((state) => state.filters);
  const setFilters = useCarStore((state) => state.setFilters);
  const clearFilters = useCarStore((state) => state.clearFilters);
  const isRTL = i18n.language !== "en";

  const [priceRange, setPriceRange] = useState([
    filters.minPrice || 0,
    filters.maxPrice || 10000,
  ]);

  const handleFilterChange = (key, value) => {
    const clean = value === "all" ? "" : value;
    setFilters(key, clean);
    onFilterChange?.(key, clean);
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
    setFilters("minPrice", value[0]);
    setFilters("maxPrice", value[1]);
    onFilterChange?.("minPrice", value[0]);
    onFilterChange?.("maxPrice", value[1]);
  };

  // Count active filters (excluding empty, 'all', or default values)
  const activeFiltersCount = Object.entries(filters).reduce(
    (count, [key, value]) => {
      if (
        key === "availability" ||
        value === undefined ||
        value === null ||
        value === "" ||
        value === "all"
      ) {
        return count;
      }
      return count + 1;
    },
    0,
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className={cn("hidden lg:block w-80 shrink-0", className)}>
        <div
          className="sticky top-24 p-6 bg-card rounded-xl border"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div
            className={`flex items-center justify-between mb-6 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <h3 className="font-semibold flex items-center">
              <SlidersHorizontal
                className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`}
              />
              {t("carFilters.filters")}
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className={isRTL ? "mr-2" : "ml-2"}>
                  {activeFiltersCount}
                </Badge>
              )}
            </h3>
          </div>
          <FilterContent
            filters={filters}
            brands={brands}
            priceRange={priceRange}
            activeFiltersCount={activeFiltersCount}
            handleFilterChange={handleFilterChange}
            handlePriceChange={handlePriceChange}
            clearFilters={clearFilters}
          />
        </div>
      </div>

      {/* Mobile Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className={`lg:hidden w-full mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <SlidersHorizontal
              className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`}
            />
            {t("carFilters.filters")}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className={isRTL ? "mr-2" : "ml-2"}>
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent
          side={isRTL ? "right" : "left"}
          className="w-7 sm:w-100 overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className={isRTL ? "text-right" : "text-left"}>
              {t("carFilters.filters")}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-2 px-10">
            <FilterContent
              filters={filters}
              brands={brands}
              priceRange={priceRange}
              activeFiltersCount={activeFiltersCount}
              handleFilterChange={handleFilterChange}
              handlePriceChange={handlePriceChange}
              clearFilters={clearFilters}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
