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
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Your Plans</h1>
      <p><strong>User ID:</strong> {userId || "Loading..."}</p>
      <button
        onClick={fetchPlans}
        style={{ padding: "0.5rem 1rem", marginTop: "1rem", cursor: "pointer" }}
      >
        Generate Plans
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {nutrition && (
        <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h2>Nutrition Plan</h2>
          <ul>
            {Object.entries(nutrition).map(([key, value]) => (
              <li key={key} style={{ marginBottom: "0.5rem" }}>
                <strong>{key.replace(/([A-Z])/g, " $1")}:</strong> {String(value)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {workout && (
        <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h2>Workout Plan</h2>

          <h3>Summary</h3>
          <p>{workout.summary}</p>

          <h3>Recommended Exercises</h3>
          {workout.recommendedExercises.map((ex: any, idx: number) => (
            <div key={idx} style={{ marginBottom: "1rem", padding: "0.5rem", border: "1px solid #eee", borderRadius: "6px" }}>
              <strong>{ex.name}</strong>
              <p>{ex.description}</p>
              <p><strong>Sets:</strong> {ex.sets} | <strong>Reps:</strong> {ex.reps} | <strong>Rest:</strong> {ex.rest}</p>
              <p><strong>Tips:</strong> {ex.tips}</p>
            </div>
          ))}

          <h3>Weekly Plan</h3>
          {workout.weeklyPlan.map((day: any, idx: number) => (
            <div key={idx} style={{ marginBottom: "0.5rem" }}>
              <strong>{day.day} - {day.focus}:</strong> {day.exercises.join(", ")}
            </div>
          ))}

          <h3>Caution</h3>
          <p>{workout.caution}</p>
        </div>
      )}
    </div>
  );
}
