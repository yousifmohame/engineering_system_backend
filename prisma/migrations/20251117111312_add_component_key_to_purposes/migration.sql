/*
  Warnings:

  - A unique constraint covering the columns `[componentKey]` on the table `RequestPurpose` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RequestPurpose" ADD COLUMN     "componentKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RequestPurpose_componentKey_key" ON "RequestPurpose"("componentKey");
