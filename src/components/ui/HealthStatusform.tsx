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
    date: "", // optional, defaults to today
    proteinIntake: "",
    carbIntake: "",
    fatIntake: "",
    caloriesIntake: "",
    caloriesBurnt: "",
    sleepHours: "",
    waterIntake: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Get userId from session
  useEffect(() => {
    const getSession = async () => {
      const session = await authClient.getSession();
      console.log("session:", session);
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
        // Only send date if user picked one, otherwise backend will use default now()
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
