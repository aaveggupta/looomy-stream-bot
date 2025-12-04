/**
 * Structured logger using Pino
 *
 * Provides fast, structured JSON logging for production
 * and pretty-printed logs for development.
 *
 * Note: pino-pretty transport is disabled in Next.js due to worker thread issues.
 * Logs will be in JSON format. To pretty-print, pipe output through pino-pretty:
 *   npm run dev | npx pino-pretty
 */

import pino from "pino";

// Create base logger with Pino
// Disable pino-pretty transport in Next.js to avoid worker thread issues
// The transport option causes "the worker has exited" errors in Next.js dev mode
const baseLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  // Disable transport - pino-pretty uses worker threads which break in Next.js
  // Logs will be JSON format. For pretty output, use: npm run dev | npx pino-pretty
  transport: undefined,
});

// Export the base logger
export const logger = baseLogger;

// Helper functions for cron-specific logging
export const cronLogger = {
  start: () => {
    logger.info("=".repeat(80));
    logger.info("CRON JOB STARTED");
  },

  end: (
    duration: number,
    stats: { total: number; success: number; errors: number }
  ) => {
    logger.info({ duration, ...stats }, "CRON JOB COMPLETED");
    logger.info("=".repeat(80));
  },

  userStart: (
    userId: string,
    config: { triggerPhrase: string; botName: string; liveChatId: string }
  ) => {
    logger.info("-".repeat(80));
    logger.info({ userId, ...config }, "Processing user");
  },

  userEnd: (
    userId: string,
    stats: { repliedCount: number; totalMessages: number }
  ) => {
    logger.info({ userId, ...stats }, "User completed");
  },

  messageStart: (
    userId: string,
    index: number,
    total: number,
    message: { id: string; author: string; text: string }
  ) => {
    logger.info(
      {
        userId,
        messageIndex: index,
        messageTotal: total,
        messageId: message.id,
        author: message.author,
        text: message.text.slice(0, 100),
      },
      `Processing message ${index}/${total}`
    );
  },

  messageSuccess: (
    userId: string,
    index: number,
    total: number,
    reply: string
  ) => {
    logger.info(
      {
        userId,
        messageIndex: index,
        messageTotal: total,
        reply: reply.slice(0, 100),
      },
      `✓ Reply sent ${index}/${total}`
    );
  },
};
