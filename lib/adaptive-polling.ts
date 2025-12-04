/**
 * Adaptive polling logic
 * Adjusts polling intervals based on chat activity
 */

const MIN_POLLING_INTERVAL = 2000; // 2 seconds (lower bound)
const MAX_POLLING_INTERVAL = 30000; // 30 seconds (upper bound)
const IDLE_MULTIPLIER = 4; // Multiply interval by 4 when idle
const ACTIVE_THRESHOLD = 3; // Consider active if messages in last N polls

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


