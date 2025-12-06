/**
 * Adaptive polling logic
 * Adjusts polling intervals based on chat activity
 */

import { POLLING_CONFIG } from "./config";

const MIN_POLLING_INTERVAL = POLLING_CONFIG.MIN_INTERVAL;
const MAX_POLLING_INTERVAL = POLLING_CONFIG.MAX_INTERVAL;
const IDLE_MULTIPLIER = POLLING_CONFIG.IDLE_MULTIPLIER;
const ACTIVE_THRESHOLD = POLLING_CONFIG.ACTIVE_THRESHOLD;

/**
 * Calculate next polling interval based on activity
 * @param currentInterval Current polling interval in milliseconds
 * @param consecutiveEmptyPolls Number of consecutive polls with no messages
 * @param platformRecommendedInterval Platform's recommended interval
 * @returns New polling interval in milliseconds
 */
export function calculateNextPollingInterval(
  currentInterval: number,
  consecutiveEmptyPolls: number,
  platformRecommendedInterval: number
): number {
  // Use platform's recommended interval as lower bound
  const baseInterval = Math.max(
    platformRecommendedInterval,
    MIN_POLLING_INTERVAL
  );

  // If we've had many empty polls, slow down
  if (consecutiveEmptyPolls >= ACTIVE_THRESHOLD) {
    const newInterval = Math.min(
      currentInterval * IDLE_MULTIPLIER,
      MAX_POLLING_INTERVAL
    );
    return Math.max(newInterval, baseInterval);
  }

  // If we're getting messages, use platform's recommended interval
  return baseInterval;
}

/**
 * Determine if chat is active based on recent polls
 * @param consecutiveEmptyPolls Number of consecutive empty polls
 * @returns True if chat is considered active
 */
export function isChatActive(consecutiveEmptyPolls: number): boolean {
  return consecutiveEmptyPolls < ACTIVE_THRESHOLD;
}


