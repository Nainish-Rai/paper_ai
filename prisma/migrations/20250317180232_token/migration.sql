/*
  Warnings:

  - The `users` column on the `Room` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `ownerId` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "content" DROP NOT NULL,
DROP COLUMN "users",
ADD COLUMN     "users" TEXT[];

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "roomId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
