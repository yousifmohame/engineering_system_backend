/*
  Warnings:

  - The `responsibilities` column on the `JobRole` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "JobRole" DROP COLUMN "responsibilities",
ADD COLUMN     "responsibilities" TEXT[];
