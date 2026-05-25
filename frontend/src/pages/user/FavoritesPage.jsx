import React, { useEffect } from "react";
import { CarCard } from "@/components/cars/CarCard";
import useFavoriteStore from "@/store/favoriteStore";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/common/PageHeader";
import { useTranslation } from "react-i18next";

const FavoritesPage = () => {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const favorites = useFavoriteStore((s) => s.favorites);
  const loading = useFavoriteStore((s) => s.loading);
  const error = useFavoriteStore((s) => s.error);
  const getFavorites = useFavoriteStore((s) => s.getFavorites);
  const clearError = useFavoriteStore((s) => s.clearError);
  const isRTL = i18n.language !== "en";

  useEffect(() => {
    getFavorites();
  }, [getFavorites]);

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-64 ${isRTL ? "text-right" : "text-left"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-gray-500">{t("favorites.loading")}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        title={t("favorites.title")}
        description={t("favorites.description", {
          name: user?.name || t("favorites.user"),
        })}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-600">
            {t("favorites.error")}: {error}
          </p>
          <button onClick={clearError} className="mt-2 text-sm text-red-700">
            {t("favorites.dismiss")}
          </button>
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t("favorites.noFavorites")}</p>
          <p className="text-gray-400 mt-2">{t("favorites.startAdding")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
