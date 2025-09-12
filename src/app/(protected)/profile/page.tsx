import Profile from "@/components/ui/Profileform";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Page Header */}
      <div className="mb-10 text-center">

        <Link href={"/dashboard"}><ChevronLeft/>
        </Link>
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          Profile
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Add or update your personal information to get personalized nutrition
          and workout plans.
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="">
        <Profile />
      </div>
    </div>
  );
}
