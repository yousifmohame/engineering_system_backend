-- CreateTable
CREATE TABLE "EmployeeSkill" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "EmployeeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeCertification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "issueDate" DATE NOT NULL,
    "expiryDate" DATE,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "EmployeeCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeEvaluation" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "evaluator" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "EmployeeEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePromotion" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "oldPosition" TEXT NOT NULL,
    "newPosition" TEXT NOT NULL,
    "oldLevel" INTEGER NOT NULL,
    "newLevel" INTEGER NOT NULL,
    "notes" TEXT,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "EmployeePromotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployeeSkill_employeeId_idx" ON "EmployeeSkill"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeCertification_employeeId_idx" ON "EmployeeCertification"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeEvaluation_employeeId_date_idx" ON "EmployeeEvaluation"("employeeId", "date");

-- CreateIndex
CREATE INDEX "EmployeePromotion_employeeId_date_idx" ON "EmployeePromotion"("employeeId", "date");

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCertification" ADD CONSTRAINT "EmployeeCertification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeEvaluation" ADD CONSTRAINT "EmployeeEvaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePromotion" ADD CONSTRAINT "EmployeePromotion_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
