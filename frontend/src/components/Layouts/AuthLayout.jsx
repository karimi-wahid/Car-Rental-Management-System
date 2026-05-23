import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import logo from "@/assets/logo.svg";

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <img src={logo} alt="logo" />
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {/* Form */}
          {children}
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-primary to-secondary relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Floating Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 w-64 h-64 bg-white/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-white p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-white/80" />
            <h2 className="text-3xl font-display font-bold mb-4">
              Premium Car Rental Experience
            </h2>
            <p className="text-lg text-white/80 max-w-md">
              Join thousands of satisfied customers who've experienced the
              luxury of our premium fleet
            </p>

            {/* Features List */}
            <div className="mt-8 space-y-4 text-left">
              {[
                "✓ Wide selection of luxury vehicles",
                "✓ 24/7 customer support",
                "✓ Best price guarantee",
                "✓ Free cancellation",
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center"
                >
                  <span className="text-white/90">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
