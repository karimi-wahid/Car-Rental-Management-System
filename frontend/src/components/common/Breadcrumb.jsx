import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export const Breadcrumb = ({ className }) => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const getDisplayName = (path) => {
    // Convert kebab-case to Title Case
    return path
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      <Link
        to="/"
        className="flex items-center text-muted-foreground hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={name} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">
                {getDisplayName(name)}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {getDisplayName(name)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
