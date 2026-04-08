"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Inter, Manrope } from "next/font/google";
import {
  Activity,
  Bolt,
  CalendarDays,
  CircleCheckBig,
  Droplets,
  Heart,
  Info,
  Moon,
  Utensils,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-update-inter" });
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-update-manrope",
});

export default function HealthStatusPage() {
  const [user, setUser] = useState<{ userId: string } | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    proteinIntake: "145",
    carbIntake: "240",
    fatIntake: "65",
    caloriesIntake: "2400",
    caloriesBurnt: "650",
    sleepHours: "7.5",
    waterIntake: "2.8",
    restingHeartRate: "64",
  });

  const [loading, setLoading] = useState(false);

  const headingDate = (formData.date ? new Date(formData.date) : new Date()).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const getSession = async () => {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        setUser({
          userId: session.data.user.id,
        });
      }
    };
    getSession();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const energyInputClass =
    "w-full rounded-xl border-none bg-[#f2f4f2] p-4 text-3xl font-bold text-[#51606b] outline-none transition focus:ring-2 focus:ring-emerald-200";

  const caloriesTaken = Number(formData.caloriesIntake) || 0;
  const caloriesBurnt = Number(formData.caloriesBurnt) || 0;
  const netCalories = caloriesTaken - caloriesBurnt;

  const proteinValue = Number(formData.proteinIntake) || 0;
  const carbValue = Number(formData.carbIntake) || 0;
  const fatValue = Number(formData.fatIntake) || 0;

  const proteinPercent = Math.min((proteinValue / 250) * 100, 100);
  const carbPercent = Math.min((carbValue / 400) * 100, 100);
  const fatPercent = Math.min((fatValue / 120) * 100, 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.userId) {
      toast.error("User not logged in");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userId: user.userId,
        ...(formData.date && { date: new Date(formData.date) }),
        proteinIntake: formData.proteinIntake
          ? parseFloat(formData.proteinIntake)
          : null,
        carbIntake: formData.carbIntake ? parseFloat(formData.carbIntake) : null,
        fatIntake: formData.fatIntake ? parseFloat(formData.fatIntake) : null,
        caloriesIntake: formData.caloriesIntake
          ? parseFloat(formData.caloriesIntake)
          : null,
        caloriesBurnt: formData.caloriesBurnt
          ? parseFloat(formData.caloriesBurnt)
          : null,
        sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : null,
        waterIntake: formData.waterIntake
          ? parseFloat(formData.waterIntake)
          : null,
      };

      const res = await fetch("/api/v1/healthstatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Daily health record saved!");
        setFormData({
          date: "",
          proteinIntake: "145",
          carbIntake: "240",
          fatIntake: "65",
          caloriesIntake: "2400",
          caloriesBurnt: "650",
          sleepHours: "7.5",
          waterIntake: "2.8",
          restingHeartRate: "64",
        });
      } else {
        toast.error(data.error || "Failed to save record");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${inter.variable} ${manrope.variable} min-h-screen bg-[#f8faf8] text-[#191c1b]`}>
        <main className="mx-auto max-w-[1320px] px-4 pb-12 pt-10 sm:px-8 lg:px-12">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#006d37]">
                Clinical Sanctuary
              </p>
              <h1 className="font-[var(--font-update-manrope)] text-4xl font-bold tracking-tight text-[#191c1b]">
                Logging for {headingDate}
              </h1>
              <p className="mt-2 max-w-xl text-base text-[#3d4a3f]">
                Update your daily vitals to receive precision health insights and
                personalized recommendations from our AI sanctuary.
              </p>
            </div>

            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-[#e1e3e1] px-6 py-3 text-sm font-semibold text-[#191c1b] transition hover:bg-[#d8dad9]"
            >
              <CalendarDays size={18} />
              Change Date
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="flex flex-col gap-8 lg:col-span-4">
              <section className="relative overflow-hidden rounded-xl bg-white p-8 shadow-[0_10px_40px_rgba(0,57,26,0.04)]">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-bl-full bg-[#006d37]/5" />
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#27ae60]/10 text-[#27ae60]">
                    <Bolt size={22} />
                  </div>
                  <h2 className="font-[var(--font-update-manrope)] text-3xl font-bold text-[#191c1b]">
                    Energy Balance
                  </h2>
                </div>

                <div className="space-y-6">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3d4a3f]">
                      Date (optional)
                    </span>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full rounded-xl border-none bg-[#f2f4f2] p-3 text-base font-semibold text-[#51606b] outline-none focus:ring-2 focus:ring-[#006d37]/20"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3d4a3f]">
                      Calories Taken (kcal)
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      name="caloriesIntake"
                      value={formData.caloriesIntake}
                      onChange={handleChange}
                      placeholder="2400"
                      className={energyInputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3d4a3f]">
                      Calories Burnt (kcal)
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      name="caloriesBurnt"
                      value={formData.caloriesBurnt}
                      onChange={handleChange}
                      placeholder="650"
                      className={energyInputClass}
                    />
                  </label>
                </div>
              </section>

              <section className="relative overflow-hidden rounded-xl bg-[#006d37] p-8 text-white">
                <div className="relative z-10">
                  <p className="text-sm font-medium text-white/70">Estimated Net</p>
                  <h3 className="font-[var(--font-update-manrope)] text-5xl font-bold">{netCalories} kcal</h3>
                  <p className="mt-4 text-xs italic leading-relaxed text-white/70">
                    "Optimal range for your current metabolic recovery phase."
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 opacity-10">
                  <Activity size={120} />
                </div>
              </section>
            </div>

            <section className="rounded-xl bg-white p-8 shadow-[0_10px_40px_rgba(0,57,26,0.04)] lg:col-span-4">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#40627b]/10 text-[#40627b]">
                  <Utensils size={20} />
                </div>
                <h2 className="font-[var(--font-update-manrope)] text-3xl font-bold text-[#191c1b]">
                  Macronutrients
                </h2>
              </div>

              <div className="space-y-10">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-semibold text-[#191c1b]">Carbohydrates</label>
                    <span className="text-sm font-bold text-[#006d37]">{carbValue}g</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#eceeec]">
                      <div
                        className="h-full rounded-full bg-[#27ae60]"
                        style={{ width: `${carbPercent}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="400"
                      step="1"
                      name="carbIntake"
                      value={carbValue}
                      onChange={handleChange}
                      className="absolute -mt-6 h-2 w-full cursor-pointer opacity-0"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-semibold text-[#191c1b]">Protein</label>
                    <span className="text-sm font-bold text-[#40627b]">{proteinValue}g</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#eceeec]">
                      <div
                        className="h-full rounded-full bg-[#40627b]"
                        style={{ width: `${proteinPercent}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="250"
                      step="1"
                      name="proteinIntake"
                      value={proteinValue}
                      onChange={handleChange}
                      className="absolute -mt-6 h-2 w-full cursor-pointer opacity-0"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-semibold text-[#191c1b]">Healthy Fats</label>
                    <span className="text-sm font-bold text-[#006d37]">{fatValue}g</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#eceeec]">
                      <div
                        className="h-full rounded-full bg-[#006d37]"
                        style={{ width: `${fatPercent}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="1"
                      name="fatIntake"
                      value={fatValue}
                      onChange={handleChange}
                      className="absolute -mt-6 h-2 w-full cursor-pointer opacity-0"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 rounded-2xl border border-[#bccabc]/20 bg-[#f2f4f2] p-4">
                <div className="flex items-start gap-3">
                  <Info size={14} className="mt-0.5 text-[#006d37]" />
                  <p className="text-xs leading-relaxed text-[#3d4a3f]">
                    Adjust the sliders to log your approximate intake for each
                    category. Percentages reflect your custom clinical plan.
                  </p>
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-8 lg:col-span-4">
              <section className="rounded-xl bg-white p-8 shadow-[0_10px_40px_rgba(0,57,26,0.04)]">
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#006d37]/10 text-[#006d37]">
                    <Activity size={20} />
                  </div>
                  <h2 className="font-[var(--font-update-manrope)] text-3xl font-bold text-[#191c1b]">
                    Daily Vitals
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl bg-[#f2f4f2] p-6 transition hover:bg-[#e1e3e1]">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#006d37] shadow-sm">
                        <Moon size={18} />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-bold uppercase text-[#3d4a3f]">
                          Sleep Duration
                        </label>
                        <div className="flex items-end gap-2">
                          <input
                            type="number"
                            step="0.1"
                            name="sleepHours"
                            value={formData.sleepHours}
                            onChange={handleChange}
                            className="w-16 border-none bg-transparent p-0 text-3xl font-bold text-[#191c1b] outline-none"
                          />
                          <span className="mb-1 text-sm text-[#3d4a3f]">hours</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#f2f4f2] p-6 transition hover:bg-[#e1e3e1]">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#40627b] shadow-sm">
                        <Droplets size={18} />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-bold uppercase text-[#3d4a3f]">
                          Water Intake
                        </label>
                        <div className="flex items-end gap-2">
                          <input
                            type="number"
                            step="0.1"
                            name="waterIntake"
                            value={formData.waterIntake}
                            onChange={handleChange}
                            className="w-16 border-none bg-transparent p-0 text-3xl font-bold text-[#191c1b] outline-none"
                          />
                          <span className="mb-1 text-sm text-[#3d4a3f]">Liters</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#f2f4f2] p-6 transition hover:bg-[#e1e3e1]">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-sm">
                        <Heart size={18} />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-bold uppercase text-[#3d4a3f]">
                          Resting Heart Rate
                        </label>
                        <div className="flex items-end gap-2">
                          <input
                            type="number"
                            step="1"
                            name="restingHeartRate"
                            value={formData.restingHeartRate}
                            onChange={handleChange}
                            className="w-16 border-none bg-transparent p-0 text-3xl font-bold text-[#191c1b] outline-none"
                          />
                          <span className="mb-1 text-sm text-[#3d4a3f]">BPM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-[#006d37] to-[#27ae60] px-6 py-6 text-lg font-bold text-white shadow-lg transition hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <CircleCheckBig size={22} />
                {loading ? "Saving..." : "Save Daily Log"}
              </button>
            </div>
          </form>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            <article className="relative overflow-hidden rounded-xl border border-[#bccabc]/20 bg-[#f2f4f2]/70 p-8">
              <div className="relative z-10 w-2/3">
                <h4 className="mb-2 font-[var(--font-update-manrope)] text-lg font-bold text-[#191c1b]">
                  Nutritional Balance
                </h4>
                <p className="text-sm text-[#3d4a3f]">
                  Your macros are currently skewed towards protein recovery.
                  Consider adding complex carbs if planning a workout later.
                </p>
              </div>
              <div className="absolute right-8 top-1/2 flex h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full border-[10px] border-[#006d37]/10">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#006d37]/20 text-sm font-bold text-[#006d37]">
                  88%
                </div>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-xl">
              <img
                alt="Meditation and wellness"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCu2n0eqZjlpdaPKyXOxami6WAF1P0WyjlyYwa6WvfzSfuHeHJH_DLdj9GZ3Hu6Cs8j5RogmcMDdlqNs1b1LT7D21YYx8N3pzgq1LZRAHQzUkpvWxZk5NeggCFQ2_eF_aFM6tWyuEivx6wodpUdAZ2brnkJlqtD1fHweUIUKN0FN4aolafTbzolN5erhxVZ4neHIf_oVbo76LAQaELkul20XE6nC2Ukyre-i4uSjhi7ojUQyQXDpYJispp6_rzdSxdWgicC96fdZddA"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#006d37]/80 to-transparent p-8">
                <div>
                  <h4 className="font-[var(--font-update-manrope)] text-lg font-bold text-white">
                    Clinical Insight
                  </h4>
                  <p className="text-sm text-white/80">
                    Logging sleep before 10 PM increases metabolic efficiency by
                    12% for your profile.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </main>
    </div>
  );
}