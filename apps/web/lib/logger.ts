/**
 * Structured logger using Pino
 *
 * Provides fast, structured JSON logging for production
 * and pretty-printed logs for development.
 */

import pino from "pino";

// Create base logger with Pino
const baseLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  // Use pino-pretty in development for readable logs
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

// Export the base logger
export const logger = baseLogger;

// Helper functions for cron-specific logging
export const cronLogger = {
  start: () => {
    logger.info("=".repeat(80));
    logger.info("CRON JOB STARTED");
  },

  end: (duration: number, stats: { total: number; success: number; errors: number }) => {
    logger.info({ duration, ...stats }, "CRON JOB COMPLETED");
    logger.info("=".repeat(80));
  },

  userStart: (userId: string, config: { triggerPhrase: string; botName: string; liveChatId: string }) => {
    logger.info("-".repeat(80));
    logger.info({ userId, ...config }, "Processing user");
  },

  userEnd: (userId: string, stats: { repliedCount: number; totalMessages: number }) => {
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

  messageSuccess: (userId: string, index: number, total: number, reply: string) => {
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
