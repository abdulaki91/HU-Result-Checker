import React from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

const LoadingSpinner = ({
  size = "md",
  text = "Loading...",
  fullScreen = false,
  className = "",
  variant = "default", // default, dots, pulse, gradient
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  // Modern gradient spinner with multiple rings
  const gradientSpinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-blue-500 border-r-indigo-500"></div>
        </motion.div>

        {/* Middle ring */}
        <motion.div
          className="absolute inset-2"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500"></div>
        </motion.div>

        {/* Inner ring */}
        <motion.div
          className="absolute inset-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-8 h-8 rounded-full border-4 border-transparent border-t-indigo-500 border-r-blue-500"></div>
        </motion.div>

        {/* Center icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Sparkles className="h-6 w-6 text-indigo-600" />
        </motion.div>

        {/* Placeholder for spacing */}
        <div className="w-16 h-16"></div>
      </div>

      {text && (
        <motion.p
          className={`${textSizeClasses[size]} mt-6 font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  // Dots spinner
  const dotsSpinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
            animate={{
              y: [0, -15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.15,
            }}
          />
        ))}
      </div>
      {text && (
        <p
          className={`${textSizeClasses[size]} text-gray-600 font-medium mt-4`}
        >
          {text}
        </p>
      )}
    </div>
  );

  // Pulse spinner
  const pulseSpinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative w-16 h-16">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-30"
            animate={{
              scale: [1, 2, 2],
              opacity: [0.6, 0.2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.6,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
        </div>
      </div>
      {text && (
        <p
          className={`${textSizeClasses[size]} text-gray-600 font-medium mt-4`}
        >
          {text}
        </p>
      )}
    </div>
  );

  // Default spinner (enhanced)
  const defaultSpinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="mb-3"
      >
        <Loader2 className={`${sizeClasses[size]} text-primary-600`} />
      </motion.div>

      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  let spinner;
  switch (variant) {
    case "gradient":
      spinner = gradientSpinner;
      break;
    case "dots":
      spinner = dotsSpinner;
      break;
    case "pulse":
      spinner = pulseSpinner;
      break;
    default:
      spinner = defaultSpinner;
  }

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-md flex items-center justify-center z-50"
      >
        {spinner}
      </motion.div>
    );
  }

  return spinner;
};

// Skeleton loader for content
export const SkeletonLoader = ({ lines = 3, className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded h-4 mb-3 ${
            index === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
};

// Card skeleton
export const CardSkeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded-lg h-48 mb-4" />
      <div className="space-y-2">
        <div className="bg-gray-200 rounded h-4 w-3/4" />
        <div className="bg-gray-200 rounded h-4 w-1/2" />
      </div>
    </div>
  );
};

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4, className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Header */}
      <div className="flex space-x-4 mb-4">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="bg-gray-200 rounded h-6 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 mb-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="bg-gray-200 rounded h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
