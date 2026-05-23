import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import useFavoriteStore from "@/store/favoriteStore";
import { useTranslation } from "react-i18next";

const FavoriteButton = ({ carId, classCode }) => {
  const { t } = useTranslation();
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const loading = useFavoriteStore((s) => s.loading);
  const error = useFavoriteStore((s) => s.error);
  const isFavoriteFn = useFavoriteStore((s) => s.isFavorite);

  const favorited = isFavoriteFn(carId);

  const handleToggle = async () => {
    try {
      await toggleFavorite(carId, favorited);
      toast.success(
        favorited
          ? t("favoriteButton.removedFromFavorites")
          : t("favoriteButton.addedToFavorites"),
      );
    } catch (err) {
      toast.error(error || t("favoriteButton.errorOccurred"));
      console.error("Error toggling favorite:", err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={`${classCode} ${favorited ? "text-red-500" : ""}`}
      disabled={loading}
      aria-label={
        favorited
          ? t("favoriteButton.removeFromFavorites")
          : t("favoriteButton.addToFavorites")
      }
    >
      <Heart className="w-4 h-4" fill={favorited ? "currentColor" : "none"} />
    </Button>
  );
};

export default FavoriteButton;
