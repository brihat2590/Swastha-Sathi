"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function HealthStatusPage() {
  const [user, setUser] = useState<{ userId: string } | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    proteinIntake: "",
    carbIntake: "",
    fatIntake: "",
    caloriesIntake: "",
    caloriesBurnt: "",
    sleepHours: "",
    waterIntake: "",
  });

  const [loading, setLoading] = useState(false);

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
          proteinIntake: "",
          carbIntake: "",
          fatIntake: "",
          caloriesIntake: "",
          caloriesBurnt: "",
          sleepHours: "",
          waterIntake: "",
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
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Daily Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Static Nutrition Info */}
          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-sm">
            <strong>How to fill these fields?</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <b>Protein (g):</b> Found in eggs (~6g/egg), chicken breast (~31g/100g), lentils (~9g/100g), paneer (~18g/100g).
              </li>
              <li>
                <b>Carbs (g):</b> Found in rice (~28g/100g cooked), roti (~15g/roti), potatoes (~17g/100g), fruits.
              </li>
              <li>
                <b>Fat (g):</b> Found in oil (~14g/tbsp), nuts (~14g/25g almonds), cheese (~9g/30g).
              </li>
              <li>
                <b>Calories (kcal):</b> Sum of all food energy. Example: 1 egg ~70 kcal, 1 roti ~70 kcal, 1 banana ~90 kcal.
              </li>
              <li>
                <b>Calories Burnt (kcal):</b> Estimate from exercise (e.g., 30 min brisk walk ~150 kcal).
              </li>
              <li>
                <b>Sleep Hours:</b> Total hours slept in last night.
              </li>
              <li>
                <b>Water Intake (liters):</b> Total water drunk in a day (1 glass ≈ 0.25L).
              </li>
            </ul>
            <div className="mt-2 text-xs text-blue-700">
              <b>Tip:</b> You can use apps like HealthifyMe, MyFitnessPal, or Google to estimate nutrition values for your meals.
            </div>
          </div>
          {/* End Static Nutrition Info */}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <Label htmlFor="date">Date (optional)</Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            {/* Protein */}
            <div>
              <Label htmlFor="proteinIntake">Protein Intake (g)</Label>
              <Input
                type="number"
                step="0.01"
                id="proteinIntake"
                name="proteinIntake"
                value={formData.proteinIntake}
                onChange={handleChange}
              />
            </div>

            {/* Carbs */}
            <div>
              <Label htmlFor="carbIntake">Carb Intake (g)</Label>
              <Input
                type="number"
                step="0.01"
                id="carbIntake"
                name="carbIntake"
                value={formData.carbIntake}
                onChange={handleChange}
              />
            </div>

            {/* Fat */}
            <div>
              <Label htmlFor="fatIntake">Fat Intake (g)</Label>
              <Input
                type="number"
                step="0.01"
                id="fatIntake"
                name="fatIntake"
                value={formData.fatIntake}
                onChange={handleChange}
              />
            </div>

            {/* Calories Intake */}
            <div>
              <Label htmlFor="caloriesIntake">Calories Intake (kcal)</Label>
              <Input
                type="number"
                step="0.01"
                id="caloriesIntake"
                name="caloriesIntake"
                value={formData.caloriesIntake}
                onChange={handleChange}
              />
            </div>

            {/* Calories Burnt */}
            <div>
              <Label htmlFor="caloriesBurnt">Calories Burnt (kcal)</Label>
              <Input
                type="number"
                step="0.01"
                id="caloriesBurnt"
                name="caloriesBurnt"
                value={formData.caloriesBurnt}
                onChange={handleChange}
              />
            </div>

            {/* Sleep Hours */}
            <div>
              <Label htmlFor="sleepHours">Sleep Hours</Label>
              <Input
                type="number"
                step="0.1"
                id="sleepHours"
                name="sleepHours"
                value={formData.sleepHours}
                onChange={handleChange}
              />
            </div>

            {/* Water Intake */}
            <div>
              <Label htmlFor="waterIntake">Water Intake (liters)</Label>
              <Input
                type="number"
                step="0.1"
                id="waterIntake"
                name="waterIntake"
                value={formData.waterIntake}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Daily Record"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}