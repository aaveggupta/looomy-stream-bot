-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('YOUTUBE', 'TWITCH', 'DISCORD');

-- CreateEnum
CREATE TYPE "StreamStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED', 'ERROR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "youtubeRefreshToken" TEXT,
    "youtubeChannelId" TEXT,
    "youtubeChannelName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isEmbedded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "autoStartEnabled" BOOLEAN NOT NULL DEFAULT true,
    "botName" TEXT NOT NULL DEFAULT 'Looomy',
    "triggerPhrase" TEXT NOT NULL DEFAULT '@looomybot',
    "maxConcurrentStreams" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "BotConfig_pkey" PRIMARY KEY ("id")
);

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
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '14 days',

    CONSTRAINT "ProcessedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BotConfig_userId_key" ON "BotConfig"("userId");

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

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotConfig" ADD CONSTRAINT "BotConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamSession" ADD CONSTRAINT "StreamSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessedMessage" ADD CONSTRAINT "ProcessedMessage_streamSessionId_fkey" FOREIGN KEY ("streamSessionId") REFERENCES "StreamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
