import { Outlet } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import UserSidebar from "@/components/user/UserSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col dark:bg-zinc-950">
      <Navbar />

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-75 p-0">
          <UserSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <UserSidebar />
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Main Content */}
        <main className="flex-1 bg-muted/10">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 md:p-6 lg:p-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default UserLayout;
