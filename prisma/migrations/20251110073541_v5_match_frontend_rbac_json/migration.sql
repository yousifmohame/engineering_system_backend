/*
  Warnings:

  - The `responsibilities` column on the `JobRole` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `actionType` on the `Permission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobRole" ADD COLUMN     "requirements" TEXT[],
DROP COLUMN "responsibilities",
ADD COLUMN     "responsibilities" TEXT[];

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "actionType",
ADD COLUMN     "category" TEXT;

-- CreateTable
CREATE TABLE "permission_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permission_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JobRoleToPermissionGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JobRoleToPermissionGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PermissionToPermissionGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToPermissionGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_groups_name_key" ON "permission_groups"("name");

-- CreateIndex
CREATE INDEX "_JobRoleToPermissionGroup_B_index" ON "_JobRoleToPermissionGroup"("B");

-- CreateIndex
CREATE INDEX "_PermissionToPermissionGroup_B_index" ON "_PermissionToPermissionGroup"("B");

-- AddForeignKey
ALTER TABLE "_JobRoleToPermissionGroup" ADD CONSTRAINT "_JobRoleToPermissionGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "JobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobRoleToPermissionGroup" ADD CONSTRAINT "_JobRoleToPermissionGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "permission_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToPermissionGroup" ADD CONSTRAINT "_PermissionToPermissionGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToPermissionGroup" ADD CONSTRAINT "_PermissionToPermissionGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "permission_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
