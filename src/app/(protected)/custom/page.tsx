"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Apple,
  AlertCircle,
  Dumbbell,
  Loader2,
  Send,
  Bot,
  User,
  ShieldAlert,
} from "lucide-react";

type NutritionPlan = {
  caloriesRecommendation?: string;
  proteinRecommendation?: string;
  carbRecommendation?: string;
  fatRecommendation?: string;
  waterRecommendation?: string;
  vitaminsMinerals?: string;
  mealTips?: string;
  caution?: string;
};

type WorkoutExercise = {
  name: string;
  description: string;
  sets: string;
  reps: string;
  rest?: string;
  tips?: string;
};

type WorkoutDay = {
  day: string;
  focus: string;
  exercises: string[];
};

type WorkoutPlan = {
  summary?: string;
  recommendedExercises?: WorkoutExercise[];
  weeklyPlan?: WorkoutDay[];
  caution?: string;
};

type StreamMessage = {
  id: string;
  role: "assistant" | "user";
  title: string;
  content: string;
  isStreaming?: boolean;
};

export default function UserPlans() {
  const { user, authloading } = useAuth();

  const [nutrition, setNutrition] = useState<NutritionPlan | null>(null);
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [preferences, setPreferences] = useState("");
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const streamContainerRef = useRef<HTMLDivElement | null>(null);

  const nutritionItems = useMemo(() => {
    if (!nutrition) return [];
    return [
      { key: "Calories", value: nutrition.caloriesRecommendation },
      { key: "Protein", value: nutrition.proteinRecommendation },
      { key: "Carbs", value: nutrition.carbRecommendation },
      { key: "Fat", value: nutrition.fatRecommendation },
      { key: "Water", value: nutrition.waterRecommendation },
      { key: "Vitamins & Minerals", value: nutrition.vitaminsMinerals },
      { key: "Meal Tips", value: nutrition.mealTips },
    ].filter((item) => item.value);
  }, [nutrition]);

  const workoutDays = workout?.weeklyPlan || [];

  const formatNutritionNarrative = (plan: NutritionPlan) => {
    return [
      "Your diet plan is ready.",
      plan.caloriesRecommendation ? `Calories: ${plan.caloriesRecommendation}` : "",
      plan.proteinRecommendation ? `Protein: ${plan.proteinRecommendation}` : "",
      plan.carbRecommendation ? `Carbs: ${plan.carbRecommendation}` : "",
      plan.fatRecommendation ? `Fat: ${plan.fatRecommendation}` : "",
      plan.waterRecommendation ? `Hydration: ${plan.waterRecommendation}` : "",
      plan.mealTips ? `Meal strategy: ${plan.mealTips}` : "",
      plan.vitaminsMinerals ? `Micronutrients: ${plan.vitaminsMinerals}` : "",
      plan.caution ? `Caution: ${plan.caution}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const formatWorkoutNarrative = (plan: WorkoutPlan) => {
    const exercises = (plan.recommendedExercises || [])
      .slice(0, 5)
      .map((ex, index) => `${index + 1}. ${ex.name} (${ex.sets} x ${ex.reps}${ex.rest ? `, rest ${ex.rest}` : ""})`)
      .join("\n");

    const schedule = (plan.weeklyPlan || [])
      .slice(0, 7)
      .map((day) => `${day.day}: ${day.focus}`)
      .join("\n");

    return [
      "Your workout plan is ready.",
      plan.summary || "",
      exercises ? `Top exercises:\n${exercises}` : "",
      schedule ? `Weekly split:\n${schedule}` : "",
      plan.caution ? `Caution: ${plan.caution}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const streamAssistantMessage = async (title: string, content: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setMessages((prev) => [...prev, { id, role: "assistant", title, content: "", isStreaming: true }]);

    let visible = "";
    const tokens = content.split(/(\s+)/).filter((token) => token.length > 0);
    for (let i = 0; i < tokens.length; i += 3) {
      visible += tokens.slice(i, i + 3).join("");
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: visible } : m)));
      await new Promise((resolve) => setTimeout(resolve, 12));
    }

    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isStreaming: false } : m)));
  };

  useEffect(() => {
    const container = streamContainerRef.current;
    if (!container) return;

    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const fetchPlans = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError("");
    setNutrition(null);
    setWorkout(null);
    setMessages([
      {
        id: `${Date.now()}-user`,
        role: "user",
        title: "My Preferences",
        content: preferences.trim() || "No specific preferences. Build a balanced plan.",
      },
    ]);

    try {
      const prefParam = encodeURIComponent(preferences.trim());

      const [nutritionRes, workoutRes] = await Promise.all([
        fetch(`/api/v1/nutrition/${user.id}?preferences=${prefParam}`),
        fetch(`/api/v1/workout/${user.id}?preferences=${prefParam}`),
      ]);

      if (!nutritionRes.ok || !workoutRes.ok) {
        throw new Error("Failed to fetch plans");
      }

      const nutritionData = await nutritionRes.json();
      const workoutData = await workoutRes.json();

      setNutrition(nutritionData as NutritionPlan);
      setWorkout(workoutData as WorkoutPlan);

      await Promise.all([
        streamAssistantMessage("Diet Plan", formatNutritionNarrative(nutritionData)),
        streamAssistantMessage("Workout Plan", formatWorkoutNarrative(workoutData)),
      ]);
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,#f1f8f4_0%,#f7faf8_45%,#f4f8f6_100%)] text-[#1a1f1c]">
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 lg:py-10 space-y-7">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-3xl border border-[#e3ece7] bg-white/85 backdrop-blur-sm p-6 md:p-8 shadow-[0_6px_20px_rgba(15,23,42,0.04)]"
        >
          <div className="flex items-start gap-4">
            <Sparkles className="h-5 w-5 text-[#2d6a4f] mt-1" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#52796f] font-semibold">Custom Planner</p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">Diet + Workout Plan Studio</h1>
              <p className="text-slate-600 mt-2 max-w-2xl leading-relaxed">
                Tell us your food and training preferences, then generate personalized plans with smooth streaming updates.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Preference Input</span>
              <textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Example: Vegetarian meals, no dairy, high-protein breakfast, knee-friendly workouts, 30 min sessions, 5 days/week"
                className="mt-2 min-h-[110px] w-full rounded-2xl border border-[#d8e4dd] bg-[#fcfefd] px-4 py-3 text-sm text-slate-800 outline-none ring-[#b7d8c8] transition focus:ring-2"
              />
            </label>

            <button
              onClick={fetchPlans}
              disabled={loading}
              className="h-fit self-end inline-flex items-center justify-center gap-2 rounded-2xl border border-[#2d6a4f] bg-[#2d6a4f] px-5 py-3 text-white font-medium hover:bg-[#245743] disabled:opacity-70 transition"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? "Generating..." : "Generate Plans"}
            </button>
          </div>
        </motion.header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
            className="rounded-3xl border border-[#e3ece7] bg-white/85 p-5 md:p-6 shadow-[0_6px_20px_rgba(15,23,42,0.03)]"
          >
            <h2 className="text-xl font-semibold tracking-tight mb-4">Streaming Assistant</h2>
            <div ref={streamContainerRef} className="space-y-5 max-h-[620px] overflow-y-auto pr-2 scroll-smooth">
              {messages.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#cfe0d6] bg-[#f7fbf9] p-4 text-sm text-[#35564a]">
                  Your generated plans will stream here in real-time.
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.article
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className={msg.role === "user"
                      ? "rounded-2xl border border-[#d9e2dc] bg-white py-4 px-5 ml-8"
                      : "rounded-2xl border border-[#d6e6dc] bg-[#f6fbf8] py-4 px-5 mr-8"
                    }
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {msg.role === "user" ? <User className="h-4 w-4 text-slate-700" /> : <Bot className="h-4 w-4 text-[#2d6a4f]" />}
                      <p className={msg.role === "user" ? "text-sm font-bold tracking-wide text-slate-800" : "text-sm font-bold tracking-wide text-[#35564a]"}>
                        {msg.title}
                      </p>
                      {msg.isStreaming && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2d6a4f]" />}
                    </div>
                    <p className="text-sm leading-7 whitespace-pre-wrap text-slate-700">{msg.content}</p>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="space-y-6 lg:max-h-[620px] lg:overflow-y-auto lg:pr-1">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
              className="rounded-3xl border border-[#e3ece7] bg-white/85 p-5 md:p-6 shadow-[0_6px_20px_rgba(15,23,42,0.03)]"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Apple className="h-5 w-5 text-[#2d6a4f]" />
                Diet Plan Snapshot
              </h2>
              {nutritionItems.length === 0 ? (
                <p className="text-sm text-slate-600">No diet plan yet. Generate a plan to populate this section.</p>
              ) : (
                <div className="space-y-2">
                  {nutritionItems.map((item) => (
                    <div key={item.key} className="rounded-xl border border-[#dce7e1] bg-[#fbfdfc] px-3 py-2.5">
                      <p className="text-xs uppercase tracking-wide text-[#52796f] font-semibold">{item.key}</p>
                      <p className="text-sm text-slate-700 mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
              className="rounded-3xl border border-[#e3ece7] bg-white/85 p-5 md:p-6 shadow-[0_6px_20px_rgba(15,23,42,0.03)]"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-[#2d6a4f]" />
                Workout Plan Snapshot
              </h2>

              {!workout ? (
                <p className="text-sm text-slate-600">No workout plan yet. Generate a plan to populate this section.</p>
              ) : (
                <div className="space-y-3">
                  {workout.summary && <p className="text-sm text-slate-700">{workout.summary}</p>}

                  {(workout.recommendedExercises || []).slice(0, 3).map((ex, i) => (
                    <div key={`${ex.name}-${i}`} className="rounded-xl border border-[#dce7e1] bg-[#fbfdfc] px-3 py-3">
                      <p className="text-sm font-semibold text-slate-800">{ex.name}</p>
                      <p className="text-xs text-slate-600 mt-1">{ex.sets} sets • {ex.reps} reps{ex.rest ? ` • Rest ${ex.rest}` : ""}</p>
                      {ex.tips && <p className="text-xs text-slate-500 mt-1">Tip: {ex.tips}</p>}
                    </div>
                  ))}

                  {workoutDays.length > 0 && (
                    <div className="pt-1">
                      <p className="text-xs uppercase tracking-wide text-[#52796f] font-semibold mb-2">Weekly Focus</p>
                      <div className="space-y-1">
                        {workoutDays.slice(0, 5).map((day, i) => (
                          <div key={`${day.day}-${i}`} className="flex items-center justify-between rounded-lg border border-[#e8efeb] bg-[#fcfefd] px-3 py-2 text-sm">
                            <span className="font-medium text-slate-800">{day.day}</span>
                            <span className="text-slate-600">{day.focus}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.section>

            {(nutrition?.caution || workout?.caution) && (
              <section className="rounded-2xl border border-[#f1d9d4] bg-[#fff8f6] p-4 text-sm text-[#9f4637] flex gap-2">
                <ShieldAlert className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-semibold">Safety Note</p>
                  <p className="mt-1">{workout?.caution || nutrition?.caution}</p>
                </div>
              </section>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}