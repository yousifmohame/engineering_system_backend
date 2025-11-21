-- CreateTable
CREATE TABLE "TransactionEmployee" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransactionEmployee_transactionId_idx" ON "TransactionEmployee"("transactionId");

-- CreateIndex
CREATE INDEX "TransactionEmployee_employeeId_idx" ON "TransactionEmployee"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionEmployee_transactionId_employeeId_key" ON "TransactionEmployee"("transactionId", "employeeId");

-- AddForeignKey
ALTER TABLE "TransactionEmployee" ADD CONSTRAINT "TransactionEmployee_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionEmployee" ADD CONSTRAINT "TransactionEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
