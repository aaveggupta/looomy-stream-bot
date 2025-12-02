-- AlterTable
ALTER TABLE "ProcessedMessage" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '14 days';
