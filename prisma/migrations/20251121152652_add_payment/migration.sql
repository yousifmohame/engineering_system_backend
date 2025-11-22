/*
  Warnings:

  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "category" TEXT DEFAULT 'أتعاب مكتب',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isFollowUpFee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "receiptImage" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
