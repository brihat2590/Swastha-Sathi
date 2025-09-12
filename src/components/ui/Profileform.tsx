"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // optional for notifications

export default function SettingsPage() {
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
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Update Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="heightCm">Height (cm)</Label>
              <Input
                type="number"
                step="0.01"
                id="heightCm"
                name="heightCm"
                value={formData.heightCm}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <Input
                type="number"
                step="0.01"
                id="weightKg"
                name="weightKg"
                value={formData.weightKg}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                className="w-full border rounded-md p-2"
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
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Input
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
