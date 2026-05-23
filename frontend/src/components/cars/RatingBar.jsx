import { Star } from "lucide-react";
import { motion } from "motion/react";

const RatingBar = ({ label, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-6 text-xs text-zinc-400 shrink-0 text-right">
        {count}
      </span>
      <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-amber-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
      <span className="w-4 text-right text-zinc-500 dark:text-zinc-400 shrink-0">
        {label}
      </span>
    </div>
  );
};

export default RatingBar;
