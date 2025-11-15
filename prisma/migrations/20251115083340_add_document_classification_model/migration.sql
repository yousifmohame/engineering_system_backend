/*
  Warnings:

  - You are about to drop the column `classification` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "classification",
ADD COLUMN     "classificationId" TEXT;

-- CreateTable
CREATE TABLE "DocumentClassification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentClassification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentClassification_name_key" ON "DocumentClassification"("name");

-- CreateIndex
CREATE INDEX "DocumentClassification_createdById_idx" ON "DocumentClassification"("createdById");

-- CreateIndex
CREATE INDEX "Document_classificationId_idx" ON "Document"("classificationId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "DocumentClassification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentClassification" ADD CONSTRAINT "DocumentClassification_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
