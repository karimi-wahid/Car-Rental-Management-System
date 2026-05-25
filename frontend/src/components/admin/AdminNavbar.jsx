import { useNavigate, Link } from "react-router-dom";
import { LogOut, ChevronDown, Moon, Sun, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { getInitials } from "@/lib/utils";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

const AdminNavbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, toggleTheme } = useThemeStore();
  const isRTL = i18n.language !== "en";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getUserRoleText = () => {
    const role = user?.role || "admin";
    return t(`roles.${role}`, t("adminNavbar.systemAdmin"));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div
        className={`flex h-16 items-center justify-between px-4 md:px-6 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        {/* Left Section */}
        <div className={`flex items-center gap-3 ${isRTL ? "order-last" : ""}`}>
          <Link
            to="/admin/dashboard"
            className="hidden md:flex items-center gap-2"
          >
            <Shield className="h-5 w-5 text-destructive" />
            <span className="text-sm font-semibold text-destructive">
              {t("adminNavbar.adminPanel")}
            </span>
          </Link>
        </div>
        {/* Right Section */}
        <div
          className={`flex items-center gap-2 ${isRTL ? "order-first" : ""}`}
        >
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`relative h-10 px-2 gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 ring-2 ring-destructive/20">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-destructive/10 text-destructive">
                    {getInitials(user?.name || t("adminNavbar.admin"))}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`hidden md:block ${isRTL ? "text-right" : "text-left"}`}
                >
                  <span className="text-sm font-medium block">
                    {user?.name || t("adminNavbar.admin")}
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    {getUserRoleText()}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isRTL ? "start" : "end"}
              className="w-56"
            >
              <DropdownMenuLabel className={isRTL ? "text-right" : "text-left"}>
                <div>
                  <p>{user?.name || t("adminNavbar.admin")}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className={`cursor-pointer text-destructive hover:text-destructive focus:text-destructive ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <LogOut className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4`} />
                <span>{t("adminNavbar.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
