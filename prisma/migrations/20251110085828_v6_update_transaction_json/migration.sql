/*
  Warnings:

  - You are about to drop the column `requirements` on the `JobRole` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the `_JobRoleToPermissionGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermissionToPermissionGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permission_groups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_JobRoleToPermissionGroup" DROP CONSTRAINT "_JobRoleToPermissionGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "_JobRoleToPermissionGroup" DROP CONSTRAINT "_JobRoleToPermissionGroup_B_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToPermissionGroup" DROP CONSTRAINT "_PermissionToPermissionGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToPermissionGroup" DROP CONSTRAINT "_PermissionToPermissionGroup_B_fkey";

-- AlterTable
ALTER TABLE "JobRole" DROP COLUMN "requirements",
ALTER COLUMN "responsibilities" DROP NOT NULL,
ALTER COLUMN "responsibilities" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "category",
ADD COLUMN     "actionType" TEXT;

-- DropTable
DROP TABLE "_JobRoleToPermissionGroup";

-- DropTable
DROP TABLE "_PermissionToPermissionGroup";

-- DropTable
DROP TABLE "permission_groups";
