import { cn } from "@/lib/utils";

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={cn(
      "text-sm font-medium pb-3 border-b-2 transition-all duration-200 whitespace-nowrap",
      active
        ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
        : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
    )}
  >
    {children}
  </button>
);

export default TabBtn;
