import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center py-20 md:py-40 mt-6">
        <h1 className="text-5xl md:text-7xl sm:text-7xl font-bold text-gray-900">
          Swastha Sathi <br /> An AI based health platform
        </h1>
        <p className="mt-6 text-lg sm:text-3xl text-gray-500 leading-8">
        Your AI health buddy. Chat, track, and stay ahead with smart
        care, health insights, and live weather updates.
</p>

        {/* CTA Buttons */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/sign-in"
            className="px-6 py-3 bg-indigo-600 text-white text-base font-medium rounded-md shadow hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
          <span className="text-gray-500">or</span>
          <Link
            href="/contact"
            className="px-6 py-3 border border-gray-300 text-gray-700 text-base font-medium rounded-md hover:bg-gray-50 transition"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
