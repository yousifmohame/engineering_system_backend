-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_transactionId_fkey";

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
