-- CreateTable
CREATE TABLE "TechnicalReport" (
    "id" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT NOT NULL,
    "oldLicenseNumber" TEXT,
    "oldLicenseDate" TEXT,
    "municipality" TEXT,
    "purpose" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "deedNumber" TEXT,
    "deedDate" TEXT,
    "district" TEXT,
    "commercialRecord" TEXT,
    "plotNumber" TEXT,
    "planNumber" TEXT,
    "area" DOUBLE PRECISION,
    "setbacks" JSONB,
    "buildingComponents" JSONB,
    "siteStatus" TEXT,
    "engineerName" TEXT,
    "officeLicense" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicalReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalReport_reportNumber_key" ON "TechnicalReport"("reportNumber");

-- CreateIndex
CREATE INDEX "TechnicalReport_transactionId_idx" ON "TechnicalReport"("transactionId");

-- AddForeignKey
ALTER TABLE "TechnicalReport" ADD CONSTRAINT "TechnicalReport_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
