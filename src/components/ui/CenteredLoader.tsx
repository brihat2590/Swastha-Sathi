import React from "react";
import { motion } from "framer-motion";

export type CenteredLoaderProps = {
  label?: string;
  fullScreen?: boolean;
  size?: number; // size of the spinner
  className?: string;
  subtleBackdrop?: boolean;
};

export default function CenteredLoader({
  label = "Swastha Sathi",
  fullScreen = true,
  size = 48,
  className = "",
  subtleBackdrop = true,
}: CenteredLoaderProps) {
  const spinnerStyle = {
    width: size,
    height: size,
    borderWidth: 2,
    borderTopColor: "transparent", // for spinning effect
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={[
        fullScreen ? "fixed inset-0" : "relative w-full h-full",
        "grid place-items-center",
        subtleBackdrop ? "backdrop-blur-sm bg-white/80 dark:bg-gray-900/80" : "",
        className,
      ].join(" ")}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex flex-col items-center gap-4 p-8"
      >
        {/* Spinner */}
        <div
          className="animate-spin rounded-full border-b-2 border-primary"
          style={spinnerStyle}
        ></div>

        {/* Label: visible and accessible */}
        <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
          {label}
        </span>
        {/* Keep for screen readers */}
        <span className="sr-only">{label}</span>
      </motion.div>
    </div>
  );
}
