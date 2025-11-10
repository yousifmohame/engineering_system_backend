/*
  Warnings:

  - You are about to drop the column `clientType` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `crNumber` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `nationalId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Client` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mobile]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idNumber]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contact` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idNumber` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identification` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `Client` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Client_crNumber_key";

-- DropIndex
DROP INDEX "Client_nationalId_key";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "clientType",
DROP COLUMN "crNumber",
DROP COLUMN "nationalId",
DROP COLUMN "phone",
ADD COLUMN     "address" JSONB,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "completionPercentage" DOUBLE PRECISION,
ADD COLUMN     "contact" JSONB NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "gradeScore" INTEGER,
ADD COLUMN     "idNumber" TEXT NOT NULL,
ADD COLUMN     "identification" JSONB NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mobile" TEXT NOT NULL,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "rating" INTEGER DEFAULT 3,
ADD COLUMN     "secretRating" INTEGER DEFAULT 50,
ADD COLUMN     "taxNumber" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "category" TEXT,
ADD COLUMN     "completedDate" TIMESTAMP(3),
ADD COLUMN     "deedNumber" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "paidAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "priority" TEXT DEFAULT 'متوسط',
ADD COLUMN     "progress" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "projectClassification" TEXT,
ADD COLUMN     "remainingAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "statusColor" TEXT DEFAULT '#6b7280',
ADD COLUMN     "totalFees" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "type" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_mobile_key" ON "Client"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_idNumber_key" ON "Client"("idNumber");
