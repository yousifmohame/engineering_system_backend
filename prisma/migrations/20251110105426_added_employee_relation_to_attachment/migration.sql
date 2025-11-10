-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "employeeId" TEXT;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
