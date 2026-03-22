import prisma from "@/lib/prisma";

export async function getUserContext(userId: string) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      age: true,
      heightCm: true,
      weightKg: true,
      gender: true,
      bloodGroup: true,
      allergies: true,
      dailyHealthRecords: {
        orderBy: { date: "desc" },
        take: 1,
        select: {
          caloriesIntake: true,
          caloriesBurnt: true,
          sleepHours: true,
          waterIntake: true,
          proteinIntake: true,
          carbIntake: true,
          fatIntake: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const latest = user.dailyHealthRecords[0];

  return {
    id: user.id,
    name: user.name,
    age: user.age,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    gender: user.gender,
    bloodGroup: user.bloodGroup,
    allergies: user.allergies,

    // ✅ SAFE DEFAULTS (IMPORTANT)
    caloriesIntake: latest?.caloriesIntake ?? 0,
    caloriesBurnt: latest?.caloriesBurnt ?? 0,
    sleepHours: latest?.sleepHours ?? 0,
    waterIntake: latest?.waterIntake ?? 0,
    proteinIntake: latest?.proteinIntake ?? 0,
    carbIntake: latest?.carbIntake ?? 0,
    fatIntake: latest?.fatIntake ?? 0,
  };
}