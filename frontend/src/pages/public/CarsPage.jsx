import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CarFilters } from "@/components/cars/CarFilters";
import { CarSorting } from "@/components/cars/CarSorting";
import { CarCard } from "@/components/cars/CarCard";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonCard } from "@/components/common/LoadingState";
import useCarStore from "@/store/carStore";
import { useTranslation } from "react-i18next";

const CarsPage = () => {
  const { t, i18n } = useTranslation();

  const {
    cars,
    loading,
    pagination,
    fetchCars,
    setFilters,
    brands,
    fetchBrands,
  } = useCarStore();
  const { currentPage, itemsPerPage } = useCarStore(
    (state) => state.pagination,
  );
  const filters = useCarStore((state) => state.filters);
  const sort = useCarStore((state) => state.sort);
  const setSort = useCarStore((state) => state.setSort);
  const clearFilters = useCarStore((state) => state.clearFilters);

  useEffect(() => {
    fetchCars(currentPage, itemsPerPage);
  }, [filters, sort, currentPage, itemsPerPage, fetchCars]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const handleSortChange = (sortBy, sortOrder) => {
    setSort(sortOrder === "desc" ? `-${sortBy}` : sortBy);
  };

  const resetFilters = () => {
    clearFilters();
    fetchCars(1, itemsPerPage);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container-custom py-8 px-2"
      dir={i18n.language === "en" ? "ltr" : "rtl"}
    >
      <PageHeader
        title={t("cars.title")}
        description={t("cars.description")}
        withBreadcrumb
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <CarFilters
          onFilterChange={handleFilterChange}
          brands={brands}
          initialFilters={filters}
        />

        {/* Main Content */}
        <div className="flex-1 p-2">
          {/* Sorting and Results Count */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center gap-4 mb-6 ${
              i18n.language === "en" ? "justify-start" : "justify-end"
            }`}
          >
            <CarSorting
              value={filters.sortBy || "createdAt"}
              order={filters.sortOrder || "desc"}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Cars Grid */}
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : cars.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {cars.map((car, index) => (
                  <CarCard key={car._id} car={car} index={index} />
                ))}
              </motion.div>
            ) : (
              <EmptyState
                icon="search"
                title={t("cars.empty.title")}
                description={t("cars.empty.description")}
                action={{
                  label: t("cars.empty.resetFilters"),
                  onClick: resetFilters,
                }}
              />
            )}
          </AnimatePresence>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              pageSize={itemsPerPage}
              totalItems={pagination.totalItems}
              onPageChange={(page) => fetchCars(page, itemsPerPage)}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CarsPage;
