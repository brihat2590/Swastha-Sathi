"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "What is this website about?",
    answer: "This website provides useful resources and tools for developers.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No, you can access most features without creating an account.",
  },
  {
    question: "Is this project open source?",
    answer: "Yes! You can explore and contribute on our GitHub repository.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h1>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left font-semibold text-lg"
            >
              {faq.question}
            </button>

            {openIndex === index && (
              <p className="mt-2 text-gray-700">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}