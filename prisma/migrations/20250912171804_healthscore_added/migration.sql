/*
  Warnings:

  - The `allergies` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "allergies",
ADD COLUMN     "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[];
