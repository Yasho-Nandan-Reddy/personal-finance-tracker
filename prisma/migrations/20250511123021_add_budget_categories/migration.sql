/*
  Warnings:

  - You are about to drop the `BudgetCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BudgetCategory" DROP CONSTRAINT "BudgetCategory_userId_fkey";

-- DropTable
DROP TABLE "BudgetCategory";
