"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Activity, Apple, Calendar, AlertCircle, Dumbbell, Coffee } from "lucide-react";

export default function UserPlans() {
  const [userId, setUserId] = useState<string>("");
  const [nutrition, setNutrition] = useState<any>(null);
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const getSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) setUserId(session.data.user.id);
      } catch (err) {
        console.error("Failed to get session:", err);
      }
    };
    getSession();
  }, []);

  const fetchPlans = async () => {
    if (!userId) return setError("User ID not available");
    setLoading(true);
    setError("");
    setNutrition(null);
    setWorkout(null);

    try {
      const [nutritionRes, workoutRes] = await Promise.all([
        fetch(`/api/v1/nutrition/${userId}`),
        fetch(`/api/v1/workout/${userId}`),
      ]);

      if (!nutritionRes.ok || !workoutRes.ok) throw new Error("Failed to fetch plans");

      setNutrition(await nutritionRes.json());
      setWorkout(await workoutRes.json());
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <h1 className="text-6xl  font-sans tracking-tight">
            Your Wellness Journey
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto font-sans">
            Personalized AI nutrition and workout plans crafted for your unique
            lifestyle and fitness goals.
          </p>
        </header>

        {/* CTA */}
        <div className="text-center mb-10">
          <button
            onClick={fetchPlans}
            disabled={loading}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {loading ? "Generating plans..." : "Generate My Plans"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-8 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm text-center">
            <p className="text-gray-700 mb-2 font-medium">
              Crafting your personalized plan...
            </p>
            <p className="text-sm text-gray-500">
              Please wait a moment while we analyze your profile.
            </p>
          </div>
        )}

        {/* Nutrition Plan */}
        {nutrition && (
          <section className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Apple className="w-6 h-6" /> Nutrition Plan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(nutrition).map(([key, value]) => (
                <div
                  key={key}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col"
                >
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="text-gray-800 mt-1 text-sm">{String(value)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Workout Plan */}
        {workout && (
          <section className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Workout Plan</h2>
            </div>
            <p className="text-gray-700">{workout.summary}</p>

            {/* Exercises */}
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5" /> Exercises
              </h3>
              <div className="space-y-4">
                {workout.recommendedExercises.map((ex: any, i: number) => (
                  <div
                    key={i}
                    className="p-5 bg-gray-50 border border-gray-100 rounded-lg"
                  >
                    <h4 className="font-semibold text-gray-800">{ex.name}</h4>
                    <p className="text-sm text-gray-600 mt-1 mb-3">{ex.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                      <span>Sets: {ex.sets}</span>
                      <span>Reps: {ex.reps}</span>
                      <span>Rest: {ex.rest}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 italic">Tips: {ex.tips}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Schedule */}
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Weekly Schedule
              </h3>
              <div className="space-y-2">
                {workout.weeklyPlan.map((day: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg p-4"
                  >
                    <span className="font-medium">{day.day}</span>
                    <span className="text-sm text-gray-600">{day.focus}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Caution */}
            <div className="bg-red-50 border border-red-100 rounded-lg p-5 text-sm text-red-800 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <span>
                <span className="font-medium">Safety Note:</span> {workout.caution}
              </span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
