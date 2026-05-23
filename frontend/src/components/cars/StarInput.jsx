import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

const StarInput = ({ value, onChange, size = 6 }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              `w-${size} h-${size} transition-colors`,
              (hovered || value) >= star
                ? "fill-amber-400 text-amber-400"
                : "text-zinc-300 dark:text-zinc-600",
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default StarInput;
