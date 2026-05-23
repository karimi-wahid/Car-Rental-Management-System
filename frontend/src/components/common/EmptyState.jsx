import { motion } from "motion/react";
import { Car, Search, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export const EmptyState = ({
  title,
  description,
  icon: IconComponent,
  icon = "car",
  action,
  secondaryAction,
}) => {
  const { t } = useTranslation();

  const icons = {
    car: Car,
    search: Search,
    filter: Filter,
  };

  const Icon = IconComponent || icons[icon] || Car;

  const finalTitle = title || t("emptyState.defaultTitle");
  const finalDescription = description || t("emptyState.defaultDescription");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-bold mb-2">{finalTitle}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {finalDescription}
      </p>
      <div className="flex gap-3 justify-center">
        {action && (
          <Button onClick={action.onClick} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </motion.div>
  );
};
