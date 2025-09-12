import React from "react"

import { CheckCircle } from "lucide-react"
import Link from "next/link"

const features = [
  "Task Assignment",
  "Project Management",
  "Analytics Dashboard",
  "Secure Authentication",
  "Task Management",
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
              SynergyShare is built to help teams stay organized, collaborate seamlessly, and track progress
              effectively. With secure authentication and powerful task management features, your team can achieve more
              together.
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

          {/* Right side */}
          <div className="flex flex-col items-center justify-center flex-1 max-w-sm">
            <div className="bg-gray-50 rounded-2xl p-8 w-full text-center border border-gray-100 shadow-sm">
              <p className="text-gray-600 mb-4 text-lg">Get started today with everything you need:</p>
              <h3 className="text-5xl font-bold mb-6 text-gray-900">
                $49<span className="text-xl text-gray-500">/mo</span>
              </h3>
              <Link
                href={"/login"}
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-semibold text-lg w-full inline-block mb-4"
              >
                Start Your Free Trial
              </Link>
              <p className="text-sm text-gray-500">No credit card required. Cancel anytime.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection