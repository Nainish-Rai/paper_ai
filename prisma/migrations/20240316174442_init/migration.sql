/*
  Warnings:

  - You are about to drop the `_RoomToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `users` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_RoomToUser" DROP CONSTRAINT "_RoomToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomToUser" DROP CONSTRAINT "_RoomToUser_B_fkey";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "users" TEXT NOT NULL;

-- DropTable
DROP TABLE "_RoomToUser";
