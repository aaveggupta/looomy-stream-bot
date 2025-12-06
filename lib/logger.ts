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
