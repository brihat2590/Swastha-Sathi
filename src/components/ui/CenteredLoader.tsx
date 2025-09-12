import React from "react";
import { Loader2, Orbit, Sparkles, Hourglass } from "lucide-react";
import { motion } from "framer-motion";

/**
 * CenteredLoader
 * --------------------------------------
 * A polished, animated loader centered in its parent (or full screen).
 *
 * Tech: React, Tailwind CSS, framer-motion, lucide-react
 *
 * Props
 * - label?: string              → Accessible text under the spinner
 * - icon?: "loader"|"orbit"|"sparkles"|"hourglass" → Choose an icon vibe
 * - fullScreen?: boolean        → If true, occupies the full viewport
 * - size?: number               → Icon size in pixels
 * - className?: string          → Extra classes for the wrapper
 * - subtleBackdrop?: boolean    → Dimmed background with blur
 *
 * Usage
 * <CenteredLoader />
 * <CenteredLoader label="Saving changes" icon="orbit" />
 * <CenteredLoader fullScreen subtleBackdrop size={56} />
 */

export type CenteredLoaderProps = {
  label?: string;
  icon?: "loader" | "orbit" | "sparkles" | "hourglass";
  fullScreen?: boolean;
  size?: number;
  className?: string;
  subtleBackdrop?: boolean;
};

const iconMap = {
  loader: Loader2,
  orbit: Orbit,
  sparkles: Sparkles,
  hourglass: Hourglass,
};

export default function CenteredLoader({
  label = "Loading...",
  icon = "loader",
  fullScreen = true,
  size = 44,
  className = "",
  subtleBackdrop = true,
}: CenteredLoaderProps) {
  const Icon = iconMap[icon] ?? Loader2;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={[
        fullScreen ? "fixed inset-0" : "relative w-full h-full",
        "grid place-items-center",
        subtleBackdrop ? "backdrop-blur-sm bg-black/5 dark:bg-white/5" : "",
        className,
      ].join(" ")}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex flex-col items-center gap-3 p-6 rounded-2xl shadow-sm dark:shadow-none"
      >
        <motion.div
          className="relative"
          animate={{ rotate: icon === "loader" || icon === "orbit" ? 360 : 0 }}
          transition={{
            repeat: icon === "loader" || icon === "orbit" ? Infinity : 0,
            ease: "linear",
            duration: 1.1,
          }}
        >
          {/* Glow ring */}
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ filter: "blur(6px)" }}
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          >
            <svg width={size + 12} height={size + 12} viewBox="0 0 100 100">
              <defs>
                <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="currentColor" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="40" stroke="url(#grad)" strokeWidth="8" fill="none" />
            </svg>
          </motion.span>

          {/* Icon */}
          <Icon
            aria-hidden
            className={[
              "drop-shadow-sm",
              icon === "loader" ? "animate-spin" : "",
            ].join(" ")}
            size={size}
            strokeWidth={2}
          />
        </motion.div>

        {label && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-muted-foreground dark:text-zinc-300"
          >
            {label}
          </motion.div>
        )}

        {/* Progress shimmer bar (decorative) */}
        <motion.div
          className="mt-1 h-1 w-40 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden"
          aria-hidden
        >
          <motion.span
            className="block h-full w-1/3 rounded-full bg-current"
            animate={{ x: ["-40%", "120%"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>

      {/* Accessible fallback text for screen readers only */}
      <span className="sr-only">{label}</span>
    </div>
  );
}