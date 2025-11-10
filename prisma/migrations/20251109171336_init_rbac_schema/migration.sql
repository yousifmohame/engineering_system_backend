/*
  Warnings:

  - You are about to drop the column `userId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "userId",
ADD COLUMN     "managerId" TEXT;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nationalId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "baseSalary" DOUBLE PRECISION,
    "jobLevel" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'full-time',
    "status" TEXT NOT NULL DEFAULT 'active',
    "nationality" TEXT,
    "gosiNumber" TEXT,
    "iqamaNumber" TEXT,
    "performanceRating" DOUBLE PRECISION,
    "frozenUntil" TIMESTAMP(3),
    "frozenReason" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRole" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "description" TEXT,
    "responsibilities" TEXT,
    "level" TEXT,
    "department" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "canAssignTasks" BOOLEAN NOT NULL DEFAULT true,
    "allowMultiple" BOOLEAN NOT NULL DEFAULT true,
    "allowMultiRole" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "parentRoleId" TEXT,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModified" TIMESTAMP(3) NOT NULL,
    "modifiedBy" TEXT,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT NOT NULL,
    "screenId" TEXT,
    "screenName" TEXT,
    "tabId" TEXT,
    "tabName" TEXT,
    "actionType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "frozenType" TEXT,
    "frozenDate" TIMESTAMP(3),
    "frozenUntil" TIMESTAMP(3),
    "frozenBy" TEXT,
    "frozenReason" TEXT,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModified" TIMESTAMP(3) NOT NULL,
    "modifiedBy" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmployeeToJobRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmployeeToJobRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EmployeeToSpecialPermission" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmployeeToSpecialPermission_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JobRoleToPermission" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JobRoleToPermission_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_nationalId_key" ON "Employee"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_phone_key" ON "Employee"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "JobRole_code_key" ON "JobRole"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "_EmployeeToJobRole_B_index" ON "_EmployeeToJobRole"("B");

-- CreateIndex
CREATE INDEX "_EmployeeToSpecialPermission_B_index" ON "_EmployeeToSpecialPermission"("B");

-- CreateIndex
CREATE INDEX "_JobRoleToPermission_B_index" ON "_JobRoleToPermission"("B");

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_parentRoleId_fkey" FOREIGN KEY ("parentRoleId") REFERENCES "JobRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToJobRole" ADD CONSTRAINT "_EmployeeToJobRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToJobRole" ADD CONSTRAINT "_EmployeeToJobRole_B_fkey" FOREIGN KEY ("B") REFERENCES "JobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToSpecialPermission" ADD CONSTRAINT "_EmployeeToSpecialPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToSpecialPermission" ADD CONSTRAINT "_EmployeeToSpecialPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobRoleToPermission" ADD CONSTRAINT "_JobRoleToPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "JobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobRoleToPermission" ADD CONSTRAINT "_JobRoleToPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
