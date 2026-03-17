"use client";

import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import {
  Activity,
  Apple,
  Calendar,
  AlertCircle,
  Dumbbell,
  Loader2,
} from "lucide-react";

export default function UserPlans() {
  const { user, authloading } = useAuth();

  const [nutrition, setNutrition] = useState<any>(null);
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPlans = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError("");
    setNutrition(null);
    setWorkout(null);

    try {
      const [nutritionRes, workoutRes] = await Promise.all([
        fetch(`/api/v1/nutrition/${user.id}`),
        fetch(`/api/v1/workout/${user.id}`),
      ]);

      if (!nutritionRes.ok || !workoutRes.ok) {
        throw new Error("Failed to fetch plans");
      }

      const nutritionData = await nutritionRes.json();
      const workoutData = await workoutRes.json();

      setNutrition(nutritionData);
      setWorkout(workoutData);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (authloading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Please login to view your wellness plans.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Header */}
        <header className="text-center mb-14">
          <h1 className="text-5xl font-semibold mb-4">
            Your Wellness Journey
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            AI generated nutrition and workout plans personalized for your
            health goals.
          </p>
        </header>

        {/* Button */}
        <div className="text-center mb-12">
          <button
            onClick={fetchPlans}
            disabled={loading}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2 mx-auto"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {loading ? "Generating Plans..." : "Generate My Plans"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-10 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Nutrition */}
        {nutrition && (
          <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-10">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Apple className="w-6 h-6" />
              Nutrition Plan
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {Object.entries(nutrition).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-gray-50 p-4 rounded-lg border"
                >
                  <p className="text-sm text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="text-gray-800 mt-1 text-sm">
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Workout */}
        {workout && (
          <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">

            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Workout Plan</h2>
            </div>

            <p className="text-gray-700 mb-8">{workout.summary}</p>

            {/* Exercises */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Exercises
              </h3>

              <div className="space-y-4">
                {workout.recommendedExercises.map((ex: any, i: number) => (
                  <div
                    key={i}
                    className="bg-gray-50 border rounded-lg p-5"
                  >
                    <h4 className="font-semibold">{ex.name}</h4>

                    <p className="text-sm text-gray-600 mt-1 mb-3">
                      {ex.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                      <span>Sets: {ex.sets}</span>
                      <span>Reps: {ex.reps}</span>
                      <span>Rest: {ex.rest}</span>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 italic">
                      Tips: {ex.tips}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Plan */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Schedule
              </h3>

              <div className="space-y-2">
                {workout.weeklyPlan.map((day: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between bg-gray-50 border rounded-lg p-4"
                  >
                    <span className="font-medium">{day.day}</span>
                    <span className="text-gray-600">{day.focus}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety */}
            <div className="bg-red-50 border border-red-100 rounded-lg p-5 mt-10 flex gap-2 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 mt-1" />
              <span>
                <strong>Safety Note:</strong> {workout.caution}
              </span>
            </div>

          </section>
        )}
      </div>
    </div>
  );
}