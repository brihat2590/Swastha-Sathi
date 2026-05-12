"use client";

import { useState } from "react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is Next.js?",
      answer: "Next.js is a React framework for building full-stack web apps."
    },
    {
      question: "Does it support TypeScript?",
      answer: "Yes. Next.js has built-in TypeScript support out of the box."
    },
    {
      question: "How do I deploy a Next.js app?",
      answer: "The easiest way is using Vercel, but you can deploy anywhere."
    }
  ];

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">FAQ</h1>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b pb-4">
            <button
              onClick={() => toggle(i)}
              className="w-full flex justify-between items-center text-left"
            >
              <span className="text-lg font-medium">{faq.question}</span>
              <span className="text-2xl">{openIndex === i ? "−" : "+"}</span>
            </button>

            {openIndex === i && (
              <p className="mt-2 text-gray-700">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
