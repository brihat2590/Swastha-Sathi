"use client";
import React from "react";

import { CheckCircle } from "lucide-react";

const features = [
    {
      title: "AI Health Chatbot",
      description:
        "Get instant health guidance with SwasthaSathi’s intelligent chatbot. Ask questions, receive insights, and access trusted information 24/7.",
    },
    {
      title: "Personalized Health Insights",
      description:
        "Track your well-being with smart analytics. Monitor trends, get recommendations, and stay proactive about your health.",
    },
    {
      title: "Weather & Air Quality Updates",
      description:
        "Stay prepared with real-time weather and air quality data. Understand how conditions affect your health and daily activities.",
    },
    {
      title: "Symptom Checker",
      description:
        "Quickly analyze symptoms and receive possible insights. Empower yourself with knowledge before visiting a doctor.",
    },
    {
      title: "Preventive Care Alerts",
      description:
        "Get reminders for healthy habits, vaccinations, and seasonal precautions tailored to your lifestyle and environment.",
    },
    {
      title: "Smart Analytics Dashboard",
      description:
        "Visualize your health journey with clear reports and analytics. Make informed choices backed by data-driven insights.",
    },
  ];
  

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h3 className="text-base font-bold text-indigo-600 uppercase tracking-wide">
            Features
          </h3>
          <h2 className="mt-4 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 sm:text-5xl text-balance">
            How Synergy Share empowers your team
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Synergy Share provides a comprehensive platform for modern teams to collaborate efficiently,
            manage projects seamlessly, and achieve more together.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col px-6 py-8 border-gray-200 
                ${index % 3 !== 0 ? "sm:border-l border-gray-200" : ""} 
                ${index > 2 ? "lg:border-t pt-10 border-gray-200" : ""}`}
            >
              <div className="flex items-center gap-4">
                <CheckCircle className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl text-gray-700 font-thin">{feature.title}</h3>
              </div>
              <p className="mt-6 text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}