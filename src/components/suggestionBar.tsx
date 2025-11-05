"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function SuggestionBar({ onSelect }: { onSelect: (text: string) => void }) {
  const suggestions = useMemo(
    () => [
      "How can I improve my sleep quality?",
  "Explain how balanced nutrition helps the body",
  "Create a daily workout plan for beginners",
  "Summarize the benefits of drinking more water",
  "Suggest a healthy diet for weight management",
  "Generate a stress relief routine",
  "Recommend healthy recipes for muscle gain",
  "Tell me a fun fact about the human body",
    ],
    []
  );

  // Duplicate items to create seamless loop
  const repeated = [...suggestions, ...suggestions];

  return (
    <div className="relative max-w-6xl mx-auto overflow-hidden py-3 bg-transparent">
      <motion.div
        className="flex gap-3"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 18,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {repeated.map((text, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(text)}
            className="whitespace-nowrap rounded-full border border-gray-300 bg-white text-gray-800 text-sm px-4 py-2 shadow-sm hover:bg-gray-100 transition-all"
          >
            {text}
          </motion.button>
        ))}
      </motion.div>

      {/* gradient fade on edges for smooth carousel look */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent"></div>
    </div>
  );
}
