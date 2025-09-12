import HealthFlowPage from "@/components/Flow-react";
import HealthStatusPage from "@/components/ui/HealthStatusform";

export default function Page() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Health Dashboard
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Track your current health status and get personalized recommendations.
        </p>
      </div>

      

      {/* Health Status Form */}
      <div className="">
        <HealthStatusPage />
      </div>
    </div>
  );
}
