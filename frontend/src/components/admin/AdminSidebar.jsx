import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Car,
  Users,
  Calendar,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Bell,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

const AdminSidebar = () => {
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const isRTL = i18n.language !== "en";

  // Navigation items with translations
  const navigation = [
    {
      name: t("adminSidebar.dashboard"),
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: t("adminSidebar.carManagement"),
      href: "/admin/cars",
      icon: Car,
    },
    {
      name: t("adminSidebar.userManagement"),
      href: "/admin/users",
      icon: Users,
    },
    {
      name: t("adminSidebar.bookings"),
      href: "/admin/bookings",
      icon: Calendar,
    },
    {
      name: t("adminSidebar.comments"),
      href: "/admin/comments",
      icon: MessageSquare,
    },
    {
      name: t("adminSidebar.messages"),
      href: "/admin/contacts",
      icon: Bell,
      badge: { count: 3, variant: "default" },
    },
  ];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Determine if sidebar should be collapsed
  const shouldCollapse = isMobile ? true : collapsed;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getUserRoleText = () => {
    const role = user?.role || "admin";
    return t(`roles.${role}`, t("adminSidebar.systemAdmin"));
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: shouldCollapse ? 60 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "relative bg-card border-l h-145",
        "flex flex-col",
        "fixed lg:relative inset-y-1.5 lg:inset-y-1.5 z-40",
        isRTL ? "right-0" : "left-0",
      )}
    >
      {/* Toggle Button - Only show on desktop */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-20 z-50 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent",
            isRTL ? "left-3" : "right-0",
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            isRTL ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )
          ) : isRTL ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      )}

      {/* User Info */}
      <div className={cn("p-4 border-b", shouldCollapse && "p-2")}>
        <div
          className={cn(
            "flex items-center",
            shouldCollapse ? "justify-center" : "gap-3",
            isRTL ? "flex-row-reverse" : "",
          )}
        >
          <Avatar className="h-10 w-10 ring-2 ring-destructive/20 shrink-0">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-destructive/10 text-destructive">
              {getInitials(user?.name || t("adminSidebar.admin"))}
            </AvatarFallback>
          </Avatar>
          {!shouldCollapse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-semibold truncate">
                {user?.name || t("adminSidebar.systemAdmin")}
              </p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full" />
                {getUserRoleText()}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className={cn("p-4", shouldCollapse && "p-2")}>
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  end={item.href === "/admin"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center rounded-lg transition-all duration-200 relative",
                      "hover:bg-accent hover:text-accent-foreground group",
                      shouldCollapse ? "justify-center p-3" : "px-4 py-3",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground",
                      isRTL ? "" : "flex-row-reverse",
                    )
                  }
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      !shouldCollapse && (isRTL ? "mr-5" : "ml-5"),
                    )}
                  />
                  {!shouldCollapse && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "text-sm font-medium flex-1",
                        isRTL ? "text-right" : "text-left",
                      )}
                    >
                      {item.name}
                    </motion.span>
                  )}

                  {/* Tooltip for collapsed/mobile state */}
                  {shouldCollapse && (
                    <div
                      className={cn(
                        "absolute px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none",
                        isRTL ? "left-full mr-2" : "right-full ml-2",
                      )}
                    >
                      {item.name}
                      {item.badge && ` (${item.badge.count})`}
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>

      {/* Logout Button */}
      <div className={cn("p-4 border-t", shouldCollapse && "p-2")}>
        <Button
          variant="ghost"
          className={cn(
            "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start group relative",
            shouldCollapse ? "justify-center p-3" : "px-4",
            isRTL && !shouldCollapse ? "flex-row-reverse" : "",
          )}
          onClick={handleLogout}
        >
          <LogOut
            className={cn(
              "w-5 h-5 shrink-0",
              !shouldCollapse && (isRTL ? "mr-2" : "ml-2"),
            )}
          />
          {!shouldCollapse && t("adminSidebar.logout")}

          {shouldCollapse && (
            <div
              className={cn(
                "absolute px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none",
                isRTL ? "left-full mr-2" : "right-full ml-2",
              )}
            >
              {t("adminSidebar.logout")}
            </div>
          )}
        </Button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
