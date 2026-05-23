import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./Breadcrumb";

export const PageHeader = ({
  title,
  description,
  actions,
  className,
  withBreadcrumb = true,
}) => {
  return (
    <div className={cn("mb-8", className)}>
      {withBreadcrumb && <Breadcrumb className="mb-4" />}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </motion.div>
    </div>
  );
};
