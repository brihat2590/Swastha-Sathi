"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

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
        if (session?.data?.user) {
          setUserId(session.data.user.id);
        }
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
        fetch(`/api/v1/workout/${userId}`)
      ]);

      if (!nutritionRes.ok || !workoutRes.ok) {
        throw new Error("Failed to fetch plans");
      }

      setNutrition(await nutritionRes.json());
      setWorkout(await workoutRes.json());
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Wellness Journey</h1>
        <p className="text-gray-600">Personalized plans crafted just for you</p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-gray-100">
        <div className="flex items-center">
          <span className="text-2xl mr-3">👤</span>
          <p className="text-gray-700">
            <strong className="font-semibold">User ID:</strong> {userId || "Loading..."}
          </p>
        </div>
      </div>

      <button
        onClick={fetchPlans}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
        disabled={loading}
      >
        <span className="flex items-center justify-center">
          {loading ? (
            <>
              <span className="text-xl mr-2">⏳</span>
              Generating Your Plans...
            </>
          ) : (
            <>
              <span className="text-xl mr-2">✨</span>
              Generate My Plans
            </>
          )}
        </span>
      </button>

      {loading && (
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🌱</span>
            <p className="text-blue-700 font-medium">Crafting your personalized wellness journey...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-8 p-6 bg-red-50 rounded-xl border border-red-100">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {nutrition && (
        <div className="mt-8 p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center mb-6">
            <span className="text-3xl mr-3">🍎</span>
            <h2 className="text-2xl font-semibold text-gray-800">Nutrition Plan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(nutrition).map(([key, value]) => (
              <div key={key} className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-start">
                  <span className="text-lg mr-2">📌</span>
                  <div>
                    <strong className="font-medium text-gray-700 capitalize block mb-1">
                      {key.replace(/([A-Z])/g, " $1")}
                    </strong>
                    <span className="text-gray-600 text-sm">{String(value)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {workout && (
        <div className="mt-8 p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center mb-6">
            <span className="text-3xl mr-3">💪</span>
            <h2 className="text-2xl font-semibold text-gray-800">Workout Plan</h2>
          </div>

          <div className="mb-8">
            <div className="flex items-center mb-3">
              <span className="text-xl mr-2">📝</span>
              <h3 className="text-xl font-medium text-gray-700">Summary</h3>
            </div>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">{workout.summary}</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="text-xl mr-2">🏋️</span>
              <h3 className="text-xl font-medium text-gray-700">Recommended Exercises</h3>
            </div>
            <div className="space-y-4">
              {workout.recommendedExercises.map((ex: any, idx: number) => (
                <div key={idx} className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-start mb-3">
                    <span className="text-lg mr-3">🔥</span>
                    <h4 className="text-lg font-medium text-gray-800">{ex.name}</h4>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">{ex.description}</p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-blue-200">
                      🎯 Sets: {ex.sets}
                    </span>
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-blue-200">
                      🔁 Reps: {ex.reps}
                    </span>
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-blue-200">
                      ⏸️ Rest: {ex.rest}
                    </span>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <p className="text-sm text-gray-700"><span className="font-medium">💡 Tips:</span> {ex.tips}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="text-xl mr-2">📅</span>
              <h3 className="text-xl font-medium text-gray-700">Weekly Plan</h3>
            </div>
            <div className="space-y-3">
              {workout.weeklyPlan.map((day: any, idx: number) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <strong className="font-medium text-gray-700">{day.day} - {day.focus}:</strong>
                  <span className="ml-2 text-gray-600">{day.exercises.join(", ")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 p-5 rounded-xl border border-red-100">
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">🚨</span>
              <h3 className="text-xl font-medium text-gray-700">Important Note</h3>
            </div>
            <p className="text-gray-700">{workout.caution}</p>
          </div>
        </div>
      )}
    </div>
  );
}