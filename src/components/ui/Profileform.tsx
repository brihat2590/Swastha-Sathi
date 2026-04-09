"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // optional for notifications

export default function Profile() {
  const [user, setUser] = useState<{ userId: string } | null>(null);
  const [formData, setFormData] = useState({
    age: "",
    heightCm: "",
    weightKg: "",
    gender: "",
    bloodGroup: "",
    allergies: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Fetch session on mount
  useEffect(() => {
    const getSession = async () => {
      const session = await authClient.getSession();
      console.log("this is the session", session);
      if (session?.data?.user) {
        setUser({
          userId: session.data.user.id,
        });
      }
    };
    getSession();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      // ✅ Convert age to int, height & weight to float
      const payload = {
        userId: user.userId,
        age: formData.age ? parseInt(formData.age, 10) : null,
        heightCm: formData.heightCm ? parseFloat(formData.heightCm) : null,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
      };

      const res = await fetch("/api/v1/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="rounded-3xl border border-slate-200/90 bg-white/80 backdrop-blur-md shadow-xl shadow-slate-300/20">
        <CardHeader className="border-b border-slate-200/80 pb-5">
          <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-[#191c1b]">
            Update Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="text-[#33423a]" htmlFor="age">Age</Label>
              <Input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="mt-2 rounded-xl border-slate-200 bg-white/90 focus-visible:ring-emerald-400"
              />
            </div>

            <div>
              <Label className="text-[#33423a]" htmlFor="heightCm">Height (cm)</Label>
              <Input
                type="number"
                step="0.01"
                id="heightCm"
                name="heightCm"
                value={formData.heightCm}
                onChange={handleChange}
                className="mt-2 rounded-xl border-slate-200 bg-white/90 focus-visible:ring-emerald-400"
              />
            </div>

            <div>
              <Label className="text-[#33423a]" htmlFor="weightKg">Weight (kg)</Label>
              <Input
                type="number"
                step="0.01"
                id="weightKg"
                name="weightKg"
                value={formData.weightKg}
                onChange={handleChange}
                className="mt-2 rounded-xl border-slate-200 bg-white/90 focus-visible:ring-emerald-400"
              />
            </div>

            <div>
              <Label className="text-[#33423a]" htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <Label className="text-[#33423a]" htmlFor="bloodGroup">Blood Group</Label>
              <Input
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="mt-2 rounded-xl border-slate-200 bg-white/90 focus-visible:ring-emerald-400"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-[#33423a]" htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="mt-2 rounded-xl border-slate-200 bg-white/90 focus-visible:ring-emerald-400"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="md:col-span-2 h-11 w-full rounded-xl bg-[#2a4f40] text-white hover:bg-[#1f3e34]"
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
