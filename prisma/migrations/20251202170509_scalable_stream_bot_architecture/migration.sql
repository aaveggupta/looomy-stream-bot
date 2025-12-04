-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('YOUTUBE', 'TWITCH', 'DISCORD');

-- CreateEnum
CREATE TYPE "StreamStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED', 'ERROR');

-- AlterTable
ALTER TABLE "BotConfig" ADD COLUMN     "maxConcurrentStreams" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "messageRetentionDays" INTEGER NOT NULL DEFAULT 14;

-- CreateTable
CREATE TABLE "StreamSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL DEFAULT 'YOUTUBE',
    "externalBroadcastId" TEXT NOT NULL,
    "externalChatId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "StreamStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "pollingIntervalMillis" INTEGER NOT NULL DEFAULT 5000,
    "lastPolledAt" TIMESTAMP(3),
    "lastPageToken" TEXT,
    "lastProcessedMessageId" TEXT,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "consecutiveEmptyPolls" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedMessage" (
    "id" TEXT NOT NULL,
    "streamSessionId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "messageText" TEXT NOT NULL,
    "question" TEXT,
    "botReply" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiQuota" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "backoffEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiQuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StreamSession_userId_status_idx" ON "StreamSession"("userId", "status");

-- CreateIndex
CREATE INDEX "StreamSession_status_lastPolledAt_idx" ON "StreamSession"("status", "lastPolledAt");

-- CreateIndex
CREATE INDEX "StreamSession_platform_status_idx" ON "StreamSession"("platform", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StreamSession_platform_externalBroadcastId_key" ON "StreamSession"("platform", "externalBroadcastId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedMessage_messageId_key" ON "ProcessedMessage"("messageId");

-- CreateIndex
CREATE INDEX "ProcessedMessage_streamSessionId_processedAt_idx" ON "ProcessedMessage"("streamSessionId", "processedAt");

-- CreateIndex
CREATE INDEX "ProcessedMessage_messageId_idx" ON "ProcessedMessage"("messageId");

-- CreateIndex
CREATE INDEX "ProcessedMessage_expiresAt_idx" ON "ProcessedMessage"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiQuota_date_key" ON "ApiQuota"("date");

-- CreateIndex
CREATE INDEX "ApiQuota_date_idx" ON "ApiQuota"("date");

-- AddForeignKey
ALTER TABLE "StreamSession" ADD CONSTRAINT "StreamSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessedMessage" ADD CONSTRAINT "ProcessedMessage_streamSessionId_fkey" FOREIGN KEY ("streamSessionId") REFERENCES "StreamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
