-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "componentsExisting" JSONB DEFAULT '[]',
ADD COLUMN     "componentsOldLicense" JSONB DEFAULT '[]',
ADD COLUMN     "componentsProposed" JSONB DEFAULT '[]';
