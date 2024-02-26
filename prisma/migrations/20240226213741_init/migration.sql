/*
  Warnings:

  - Changed the type of `github_id` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "github_id",
ADD COLUMN     "github_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_github_id_key" ON "User"("github_id");
