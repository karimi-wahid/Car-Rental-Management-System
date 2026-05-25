import {
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const CarActionsDropdown = ({
  car,
  onEdit,
  onView,
  onToggleAvailability,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  const handleDelete = async () => {
    try {
      await onDelete(car._id);
      toast.success(t("carActions.deleteSuccess"));
    } catch (error) {
      toast.error(t("carActions.deleteError"));
      console.log(error);
    }
  };

  const handleToggleAvailability = () => {
    onToggleAvailability(car._id, car.availability);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "end" : "start"}>
        <DropdownMenuLabel className={isRTL ? "text-right" : "text-left"}>
          {t("carActions.actions")}
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onEdit(car)}
          className={isRTL ? "flex-row-reverse" : ""}
        >
          <Edit className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
          {t("carActions.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onView(car._id)}
          className={isRTL ? "flex-row-reverse" : ""}
        >
          <Eye className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
          {t("carActions.view")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleToggleAvailability}
          className={isRTL ? "flex-row-reverse" : ""}
        >
          {car.availability ? (
            <>
              <XCircle className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("carActions.makeUnavailable")}
            </>
          ) : (
            <>
              <CheckCircle className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("carActions.makeAvailable")}
            </>
          )}
        </DropdownMenuItem>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className={`text-red-600 ${isRTL ? "flex-row-reverse" : ""}`}
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("carActions.delete")}
            </DropdownMenuItem>
          </AlertDialogTrigger>

          <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
            <AlertDialogHeader>
              <AlertDialogTitle className={isRTL ? "text-right" : "text-left"}>
                {t("carActions.deleteConfirmTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription
                className={isRTL ? "text-right" : "text-left"}
              >
                {t("carActions.deleteConfirmDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className={isRTL ? "flex-row-reverse" : ""}>
              <AlertDialogCancel>
                {t("carActions.common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                {t("carActions.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CarActionsDropdown;
