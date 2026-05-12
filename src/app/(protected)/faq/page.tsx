"use client";

import React from "react";

export default function FAQPage() {
  const faqs = [
    {
      question: "What is Swastha Sathi?",
      answer:
        "Swastha Sathi is an AI-powered health application that allows users to consult with an AI doctor, get medical guidance, view real-time weather updates, and discover nearby hospitals, clinics, and pharmacies."
    },
    {
      question: "How does the AI doctor consultation work?",
      answer:
        "You can chat with the AI doctor just like messaging a real doctor. The AI analyzes your symptoms and provides medical suggestions, lifestyle advice, and possible treatment options. It does not replace professional medical care, but offers helpful guidance."
    },
    {
      question: "Can Swastha Sathi show nearby hospitals and clinics?",
      answer:
        "Yes. Using your device’s location (with your permission), the app displays nearby hospitals, clinics, urgent care centers, and pharmacies so you can quickly find medical help around you."
    },
    {
      question: "Does the app show real-time weather updates?",
      answer:
        "Absolutely! Swastha Sathi includes a real-time weather dashboard that shows temperature, humidity, air quality, and health-related weather alerts such as pollution risks."
    },
    {
      question: "Is my health data stored or shared?",
      answer:
        "No. Swastha Sathi does not store or share your personal health conversations. Your chats with the AI doctor are processed securely and are not accessible to any third party."
    },
    {
      question: "Does the app require an internet connection?",
      answer:
        "Yes. AI chat, weather updates, and nearby hospital search require an active internet connection to work properly."
    },
    {
      question: "Is Swastha Sathi free to use?",
      answer:
        "Yes, the core features such as AI chat, weather updates, and nearby hospital locator are completely free. Additional premium features may be added in the future."
    },
    {
      question: "Can I use Swastha Sathi for emergency medical situations?",
      answer:
        "No. Swastha Sathi is not a replacement for emergency medical services. In critical situations, you should immediately call your local emergency number or visit the nearest hospital."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Frequently Asked Questions
      </h1>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">{faq.question}</h2>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
