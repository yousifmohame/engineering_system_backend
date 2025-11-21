/*
  Warnings:

  - The `notes` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "approvals" JSONB DEFAULT '{}',
DROP COLUMN "notes",
ADD COLUMN     "notes" JSONB DEFAULT '{}';
