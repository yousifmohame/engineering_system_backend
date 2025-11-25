/*
  Warnings:

  - You are about to drop the `TechnicalReport` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TechnicalReport" DROP CONSTRAINT "TechnicalReport_transactionId_fkey";

-- DropTable
DROP TABLE "TechnicalReport";
