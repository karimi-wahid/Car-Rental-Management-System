import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

const StarDisplay = ({ value, size = 4 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={cn(
          `w-${size} h-${size}`,
          value >= star
            ? "fill-amber-400 text-amber-400"
            : "text-zinc-200 dark:text-zinc-700",
        )}
      />
    ))}
  </div>
);

export default StarDisplay;
