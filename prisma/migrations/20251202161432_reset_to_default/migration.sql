/*
  Warnings:

  - You are about to drop the column `autoStartEnabled` on the `BotConfig` table. All the data in the column will be lost.
  - You are about to drop the column `maxConcurrentStreams` on the `BotConfig` table. All the data in the column will be lost.
  - You are about to drop the `ProcessedMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StreamSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProcessedMessage" DROP CONSTRAINT "ProcessedMessage_streamSessionId_fkey";

-- DropForeignKey
ALTER TABLE "StreamSession" DROP CONSTRAINT "StreamSession_userId_fkey";

-- AlterTable
ALTER TABLE "BotConfig" DROP COLUMN "autoStartEnabled",
DROP COLUMN "maxConcurrentStreams",
ADD COLUMN     "liveChatId" TEXT;

-- DropTable
DROP TABLE "ProcessedMessage";

-- DropTable
DROP TABLE "StreamSession";

-- DropEnum
DROP TYPE "Platform";

-- DropEnum
DROP TYPE "StreamStatus";
