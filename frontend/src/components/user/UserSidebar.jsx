import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  History,
  Settings,
  Heart,
  Bell,
  ChevronLeft,
  Headphones,
  MessageSquare,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

const UserSidebar = () => {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const isRTL = i18n.language !== "en";

  const navigation = [
    {
      name: t("userSidebar.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    { name: t("userSidebar.myBookings"), href: "/bookings", icon: Calendar },
    {
      name: t("userSidebar.bookingHistory"),
      href: "/bookings/history",
      icon: History,
    },
    { name: t("userSidebar.favorites"), href: "/favorites", icon: Heart },
    {
      name: t("userSidebar.feedback"),
      href: "/feedbacks",
      icon: MessageSquare,
    },
    { name: t("userSidebar.settings"), href: "/settings", icon: Settings },
  ];

  // Helper function to get role display text
  const getRoleDisplay = (role) => {
    switch (role) {
      case "admin":
        return t("userSidebar.admin");
      case "user":
        return t("userSidebar.user");
      default:
        return t("userSidebar.user");
    }
  };

  return (
    <aside
      className="flex flex-col w-80 border-l bg-card"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* User Profile Section */}
      <div className="p-6 border-b">
        <div
          className={`flex items-center gap-4 ${isRTL ? "" : "flex-row-reverse"}`}
        >
          <Avatar className="h-16 w-16 ring-2 ring-primary/20">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {getInitials(user?.name || t("userSidebar.user"))}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2
              className={`text-lg font-semibold truncate ${isRTL ? "text-right" : "text-left"}`}
            >
              {user?.name || t("userSidebar.user")}
            </h2>
            <p
              className={`text-sm text-muted-foreground truncate ${isRTL ? "text-right" : "text-left"}`}
            >
              {user?.email || "user@example.com"}
            </p>
            <div
              className={`flex items-center mt-1 ${isRTL ? "justify-end" : "justify-start"}`}
            >
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                {getRoleDisplay(user?.role)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground",
                    isRTL ? "" : "flex-row-reverse",
                  )
                }
                end={item.href === "/dashboard"}
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`flex items-center gap-3 ${isRTL ? "" : "flex-row-reverse"}`}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5",
                          isActive ? "animate-pulse" : "",
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                    <ChevronLeft
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isActive
                          ? isRTL
                            ? "translate-x-1"
                            : "-translate-x-1"
                          : "opacity-0 group-hover:opacity-100",
                      )}
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section - Support */}
      <div className="p-4 border-t">
        <div className="rounded-lg bg-muted/50 p-4">
          <div
            className={`flex items-center gap-2 mb-2 ${isRTL ? "" : "flex-row-reverse"}`}
          >
            <Headphones className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold">
              {t("userSidebar.needHelp")}
            </h4>
          </div>
          <p
            className={`text-xs text-muted-foreground mb-3 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("userSidebar.supportAvailable")}
          </p>
          <button
            className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            onClick={() => {
              navigate("/support");
              scrollTo(0, 0);
            }}
          >
            {t("userSidebar.getSupport")}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default UserSidebar;
