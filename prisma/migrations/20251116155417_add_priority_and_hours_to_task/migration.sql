-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "estimatedHours" DOUBLE PRECISION,
ADD COLUMN     "priority" TEXT DEFAULT 'medium';
