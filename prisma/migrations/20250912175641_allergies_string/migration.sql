-- AlterTable
ALTER TABLE "public"."user" ALTER COLUMN "allergies" DROP NOT NULL,
ALTER COLUMN "allergies" DROP DEFAULT,
ALTER COLUMN "allergies" SET DATA TYPE TEXT;
