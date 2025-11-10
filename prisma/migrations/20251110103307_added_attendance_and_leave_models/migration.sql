-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "permissionsCount" INTEGER;

-- CreateTable
CREATE TABLE "EmployeeAttendance" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "checkIn" TIME,
    "checkOut" TIME,
    "notes" TEXT,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "EmployeeAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeLeaveRequest" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "reason" TEXT,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "EmployeeLeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployeeAttendance_employeeId_date_idx" ON "EmployeeAttendance"("employeeId", "date");

-- CreateIndex
CREATE INDEX "EmployeeLeaveRequest_employeeId_idx" ON "EmployeeLeaveRequest"("employeeId");

-- AddForeignKey
ALTER TABLE "EmployeeAttendance" ADD CONSTRAINT "EmployeeAttendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLeaveRequest" ADD CONSTRAINT "EmployeeLeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
