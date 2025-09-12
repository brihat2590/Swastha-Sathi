-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "heightCm" DOUBLE PRECISION,
ADD COLUMN     "weightKg" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."daily_health_record" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proteinIntake" DOUBLE PRECISION,
    "carbIntake" DOUBLE PRECISION,
    "fatIntake" DOUBLE PRECISION,
    "caloriesIntake" DOUBLE PRECISION,
    "caloriesBurnt" DOUBLE PRECISION,
    "sleepHours" DOUBLE PRECISION,
    "waterIntake" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_health_record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_health_record_userId_date_key" ON "public"."daily_health_record"("userId", "date");

-- AddForeignKey
ALTER TABLE "public"."daily_health_record" ADD CONSTRAINT "daily_health_record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
