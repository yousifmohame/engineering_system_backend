/*
  Warnings:

  - You are about to drop the column `projectClassification` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "projectClassification",
ADD COLUMN     "authorities" TEXT[],
ADD COLUMN     "complexity" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "fees" JSONB,
ADD COLUMN     "notes" TEXT[],
ADD COLUMN     "stages" JSONB,
ADD COLUMN     "warnings" TEXT[];

-- AlterTable
ALTER TABLE "TransactionType" ADD COLUMN     "authorities" TEXT[],
ADD COLUMN     "category" TEXT,
ADD COLUMN     "categoryAr" TEXT,
ADD COLUMN     "complexity" TEXT,
ADD COLUMN     "documents" TEXT[],
ADD COLUMN     "duration" INTEGER DEFAULT 0,
ADD COLUMN     "estimatedCost" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "fees" JSONB,
ADD COLUMN     "notes" TEXT[],
ADD COLUMN     "stages" JSONB,
ADD COLUMN     "tasks" JSONB,
ADD COLUMN     "warnings" TEXT[];
