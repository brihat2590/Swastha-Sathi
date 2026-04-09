import Profile from "@/components/ui/Profileform";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#edf5f0_0%,#f7f9f8_38%,#f6f7f8_100%)] text-[#191c1b] px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#315446] font-semibold hover:text-[#1f3e34] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/85 p-6 md:p-8 shadow-lg shadow-slate-300/20">
          <div className="relative z-10 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#191c1b]">
              Profile
            </h1>
            <p className="mt-3 text-base md:text-lg text-[#3d4a3f] max-w-3xl">
              Add or update your personal information to get personalized nutrition and workout plans.
            </p>
          </div>
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#4f8d72]/10 blur-3xl" />
        </section>

        <div className="pb-2">
          <Profile />
        </div>
      </div>
    </div>
  );
}
