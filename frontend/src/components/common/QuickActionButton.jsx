import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const QuickActionButton = ({
  onClick,
  disabled = false,
  loading = false,
  children,
  icon: Icon,
  variant = "primary",
  size = "md",
  className = "",
  loadingText = "Loading...",
  ...props
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300",
    success:
      "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl",
    warning:
      "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm h-10",
    md: "px-6 py-3 text-base h-12",
    lg: "px-8 py-4 text-lg h-16",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <motion.button
      whileHover={{
        scale: disabled || loading ? 1 : 1.02,
        y: disabled || loading ? 0 : -1,
      }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl font-semibold
        transition-all duration-300
        flex items-center justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-4 focus:ring-blue-500/20
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className={`${iconSizes[size]} mr-2 animate-spin`} />
          <span className="hidden sm:inline">{loadingText}</span>
          <span className="sm:hidden">...</span>
        </>
      ) : (
        <>
          {Icon && (
            <Icon className={`${iconSizes[size]} ${children ? "mr-2" : ""}`} />
          )}
          {children && <span>{children}</span>}
        </>
      )}
    </motion.button>
  );
};

export default QuickActionButton;
