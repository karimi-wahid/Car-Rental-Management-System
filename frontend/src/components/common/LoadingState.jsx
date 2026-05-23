import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const LoadingState = ({ className, size = "md", text }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="mt-4 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

export const PageLoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState size="lg" text="Loading..." />
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="space-y-3">
        <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        <div className="h-20 bg-muted rounded animate-pulse" />
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
};
