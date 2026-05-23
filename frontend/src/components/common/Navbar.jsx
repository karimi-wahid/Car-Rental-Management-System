import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  User,
  Shield,
  Home,
  Info,
  Phone,
  Car,
} from "lucide-react";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuthStore } from "@/store/authStore";

import logo from "../../assets/logo.svg";
import { getInitials } from "@/lib/utils";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  // Get user role
  const userRole = user?.role || "user";

  // Role-based navigation items
  const getNavItems = () => {
    const commonItems = [
      {
        name: t("navbar.home"),
        path: "/",
        icon: Home,
      },

      {
        name: t("navbar.cars"),
        path: "/cars",
        icon: Car,
      },

      {
        name: t("navbar.about"),
        path: "/about",
        icon: Info,
      },

      {
        name: t("navbar.contact"),
        path: "/contact",
        icon: Phone,
      },
    ];

    if (!isAuthenticated || !user) {
      return commonItems;
    }

    if (userRole === "admin") {
      return [
        ...commonItems,
        {
          name: t("navbar.adminPanel"),
          path: "/admin/dashboard",
          icon: Shield,
        },
      ];
    } else {
      return [
        ...commonItems,
        {
          name: t("navbar.dashboard"),
          path: "/dashboard",
          icon: LayoutDashboard,
        },
      ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/");
  };

  // Get dashboard path based on role
  const getDashboardPath = () => {
    return userRole === "admin" ? "/admin/dashboard" : "/dashboard";
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur-xl px-5">
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} className="h-8" alt="Logo" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => scrollTo(0, 0)}
              className="relative text-sm text-muted-foreground transition hover:text-foreground flex items-center gap-2"
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {userRole === "admin"
                        ? t("roles.admin")
                        : t("roles.user")}
                    </p>
                  </div>
                  <Avatar className="cursor-pointer ring-2 ring-primary/20">
                    <AvatarImage src={user?.avatar} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={() => {
                    navigate(getDashboardPath());
                    setOpen(false);
                  }}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {userRole === "admin"
                    ? t("navbar.adminPanel")
                    : t("navbar.dashboard")}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    navigate("/settings");
                    setOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  {t("navbar.profile")}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 focus:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("navbar.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/login");
                  scrollTo(0, 0);
                }}
              >
                {t("navbar.login")}
              </Button>
              <Button
                onClick={() => {
                  navigate("/register");
                  scrollTo(0, 0);
                }}
              >
                {t("navbar.register")}
              </Button>
            </div>
          )}

          {/* Mobile Toggle */}
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t bg-background/95 backdrop-blur"
          >
            <div className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm hover:bg-accent transition flex items-center gap-2"
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.name}
                </Link>
              ))}

              {isAuthenticated && user && (
                <>
                  <div className="border-t my-2 pt-2">
                    <p className="px-3 py-2 text-sm font-medium">{user.name}</p>
                    <p className="px-3 py-1 text-xs text-muted-foreground capitalize">
                      {userRole === "admin"
                        ? t("roles.admin")
                        : t("roles.user")}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      navigate(getDashboardPath());
                      setOpen(false);
                    }}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {userRole === "admin"
                      ? t("navbar.adminPanel")
                      : t("navbar.dashboard")}
                  </Button>

                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      navigate("/settings");
                      scrollTo(0, 0);
                      setOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t("navbar.profile")}
                  </Button>

                  <Button
                    variant="ghost"
                    className="justify-start text-red-600 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("navbar.logout")}
                  </Button>
                </>
              )}

              {!isAuthenticated && (
                <div className="flex flex-col gap-2 mt-2">
                  <Button
                    onClick={() => {
                      navigate("/login");
                      scrollTo(0, 0);
                      setOpen(false);
                    }}
                  >
                    {t("navbar.login")}
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/register");
                      scrollTo(0, 0);
                      setOpen(false);
                    }}
                  >
                    {t("navbar.register")}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
