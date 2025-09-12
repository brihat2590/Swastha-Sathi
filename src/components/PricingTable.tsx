import React from "react"

import { CheckCircle } from "lucide-react"
import Link from "next/link"
import HealthFlowPage from "@/components/Flow-react"

const features = [
  "Personal Health Insights",
  "Symptom Checker",
  "Weather and Air quality",
  " ",
  " ",
]

const PricingSection = () => {
  return (
    <section id="pricing" className="w-full bg-white py-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20 min-h-[500px]">
          {/* Left side */}
          <div className="flex-1 max-w-lg">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">Work Smarter with SynergyShare</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              
            </p>

            <h3 className="text-sm font-bold text-indigo-600 uppercase mb-6 border-b border-gray-200 pb-3">
              Core Features
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="text-indigo-600 flex-shrink-0" size={20} />
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <HealthFlowPage/>

          
         
        </div>
      </div>
    </section>
  )
}

export default PricingSection