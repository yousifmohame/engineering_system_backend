/*
  Warnings:

  - You are about to drop the column `estimatedHours` on the `Task` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[taskNumber]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "estimatedHours",
ADD COLUMN     "assignedById" TEXT,
ADD COLUMN     "attachmentsCount" INTEGER DEFAULT 0,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "commentsCount" INTEGER DEFAULT 0,
ADD COLUMN     "completedDate" TIMESTAMP(3),
ADD COLUMN     "fees" JSONB,
ADD COLUMN     "progress" INTEGER DEFAULT 0,
ADD COLUMN     "receivedDate" TIMESTAMP(3),
ADD COLUMN     "taskNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Task_taskNumber_key" ON "Task"("taskNumber");

-- CreateIndex
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");

-- CreateIndex
CREATE INDEX "Task_transactionId_idx" ON "Task"("transactionId");
