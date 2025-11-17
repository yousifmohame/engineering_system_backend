/*
  Warnings:

  - You are about to drop the column `componentKey` on the `RequestPurpose` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "RequestPurpose_componentKey_key";

-- AlterTable
ALTER TABLE "RequestPurpose" DROP COLUMN "componentKey";

-- CreateTable
CREATE TABLE "DynamicFormDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "purposeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicFormDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicFormField" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "optionsJson" JSONB,
    "validationJson" JSONB,
    "placeholder" TEXT,
    "formId" TEXT NOT NULL,

    CONSTRAINT "DynamicFormField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DynamicFormDefinition_name_key" ON "DynamicFormDefinition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DynamicFormDefinition_purposeId_key" ON "DynamicFormDefinition"("purposeId");

-- CreateIndex
CREATE INDEX "DynamicFormField_formId_idx" ON "DynamicFormField"("formId");

-- CreateIndex
CREATE UNIQUE INDEX "DynamicFormField_formId_fieldKey_key" ON "DynamicFormField"("formId", "fieldKey");

-- AddForeignKey
ALTER TABLE "DynamicFormDefinition" ADD CONSTRAINT "DynamicFormDefinition_purposeId_fkey" FOREIGN KEY ("purposeId") REFERENCES "RequestPurpose"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicFormField" ADD CONSTRAINT "DynamicFormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "DynamicFormDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
