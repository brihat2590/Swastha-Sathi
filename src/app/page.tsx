"use client";

import { motion, type Variants } from "motion/react";
const features = [
  {
    title: "AI Health Assistant",
    description:
      "Chat instantly with a smart AI companion for personalized wellness guidance.",
  },
  {
    title: "Live Weather + Health Alerts",
    description:
      "Get weather-aware recommendations to stay safe during heat, rain, and pollution.",
  },
  {
    title: "Nearby Hospital Information",
    description:
      "Find hospitals and clinics around you quickly with relevant emergency details.",
  },
];

const containerVariants:Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const stars = Array.from({ length: 5 });

export default function Page() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 -z-20">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover [transform:scaleY(-1)]"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4"
        />
      </div>

      {/* White Gradient Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[26.416%] from-[rgba(255,255,255,0)] to-[66.943%] to-white" />

      {/* Content */}
      <div className="mx-auto flex min-h-screen max-w-[1200px] justify-center px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full pt-[290px] flex flex-col gap-8"
        >
          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-[Geist] text-[80px] font-medium leading-[0.98] tracking-[-0.04em] text-[#111111]"
          >
            Smart{" "}
            <span className="font-['Instrument Serif'] text-[100px] italic font-normal tracking-[-0.03em]">
              healthcare
            </span>{" "}
            for every family
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="max-w-[554px] font-[Geist] text-[18px] leading-relaxed text-[#373a46]/80"
          >
            Swastha Sathi is an AI-driven health app that brings real-time weather
            updates, nearby hospital information, and a smart chatbot to guide your
            daily health decisions.
          </motion.p>

          {/* Input + CTA + Social Proof */}
          <motion.div variants={itemVariants} className="flex flex-col gap-5">
            
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                
                <button
                  type="button"
                  className="h-14 rounded-[32px] px-7 font-[Geist] text-[15px] font-medium text-white
                             bg-gradient-to-b from-[#3a3a3a] via-[#181818] to-[#0c0c0c]
                             shadow-[inset_-4px_-6px_25px_0px_rgba(201,201,201,0.08),inset_4px_4px_10px_0px_rgba(29,29,29,0.24)]
                             transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
                >
                  Join Swastha Sathi
                </button>
              </div>
           

            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-black/5 bg-white/80 px-4 py-2 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                {stars.map((_, i) => (
                  <svg
                    key={i}
                    viewBox="0 0 20 20"
                    className="h-4 w-4 fill-[#111111]"
                    aria-hidden="true"
                  >
                    <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 15.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                  </svg>
                ))}
              </div>
              <span className="h-4 w-px bg-black/10" />
              <span className="font-[Geist] text-[14px] text-[#373a46]">
                <span className="font-medium text-[#111]">1,020+</span> Health Users
              </span>
            </div>
          </motion.div>
        </motion.div>

        
      </div>
      <section id="features" className="mx-auto max-w-[1200px] px-6 pb-24">
  <motion.div
    variants={containerVariants}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.2 }}
    className="flex flex-col gap-8"
  >
    <motion.h2
      variants={itemVariants}
      className="font-[Geist] text-[42px] font-medium leading-tight tracking-[-0.03em] text-[#111]"
    >
      Powerful features of Swastha Sathi
    </motion.h2>

    <div className="grid gap-5 md:grid-cols-3">
      {features.map((feature) => (
        <motion.div
          key={feature.title}
          variants={itemVariants}
          className="rounded-[24px] border border-black/10 bg-white p-6 shadow-[0px_10px_30px_0px_rgba(30,30,30,0.04)]"
        >
          <h3 className="font-[Geist] text-[22px] font-medium text-[#111]">
            {feature.title}
          </h3>
          <p className="mt-3 font-[Geist] text-[16px] leading-relaxed text-[#373a46]/80">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </div>
  </motion.div>
</section>
    </section>
  );
}