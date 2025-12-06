import { describe, it, expect } from "vitest";
import { calculateNextPollingInterval, isChatActive } from "./adaptive-polling";
import { POLLING_CONFIG } from "./config";

describe("calculateNextPollingInterval", () => {
  const { MIN_INTERVAL, MAX_INTERVAL, IDLE_MULTIPLIER, ACTIVE_THRESHOLD } = POLLING_CONFIG;

  describe("active chat scenarios", () => {
    it("should use platform recommended interval when chat is active", () => {
      const result = calculateNextPollingInterval(
        5000, // currentInterval
        0, // consecutiveEmptyPolls (active)
        3000 // platformRecommendedInterval
      );

      expect(result).toBe(3000);
    });

    it("should use MIN_INTERVAL if platform recommends lower", () => {
      const result = calculateNextPollingInterval(
        5000,
        0,
        1000 // lower than MIN_INTERVAL
      );

      expect(result).toBe(MIN_INTERVAL);
    });

    it("should respect platform interval when above minimum", () => {
      const result = calculateNextPollingInterval(
        5000,
        1, // still active (below threshold)
        4000
      );

      expect(result).toBe(4000);
    });

    it("should stay active until threshold is reached", () => {
      const result = calculateNextPollingInterval(
        5000,
        ACTIVE_THRESHOLD - 1, // just below threshold
        3000
      );

      expect(result).toBe(3000);
    });
  });

  describe("idle chat scenarios", () => {
    it("should slow down when consecutive empty polls reach threshold", () => {
      const currentInterval = 5000;
      const result = calculateNextPollingInterval(
        currentInterval,
        ACTIVE_THRESHOLD, // at threshold
        3000
      );

      expect(result).toBe(currentInterval * IDLE_MULTIPLIER);
    });

    it("should continue slowing down with more empty polls", () => {
      const currentInterval = 5000;
      const result = calculateNextPollingInterval(
        currentInterval,
        ACTIVE_THRESHOLD + 5, // well above threshold
        3000
      );

      expect(result).toBe(currentInterval * IDLE_MULTIPLIER);
    });

    it("should not exceed MAX_INTERVAL", () => {
      const result = calculateNextPollingInterval(
        MAX_INTERVAL, // already at max
        ACTIVE_THRESHOLD + 10,
        3000
      );

      expect(result).toBe(MAX_INTERVAL);
    });

    it("should cap at MAX_INTERVAL when multiplied interval exceeds it", () => {
      const result = calculateNextPollingInterval(
        MAX_INTERVAL / 2, // would exceed max when multiplied
        ACTIVE_THRESHOLD,
        3000
      );

      expect(result).toBeLessThanOrEqual(MAX_INTERVAL);
    });

    it("should respect platform interval as minimum even when idle", () => {
      const result = calculateNextPollingInterval(
        1000, // very low current
        ACTIVE_THRESHOLD,
        5000 // platform wants higher
      );

      expect(result).toBeGreaterThanOrEqual(5000);
    });
  });

  describe("edge cases", () => {
    it("should handle zero consecutive empty polls", () => {
      const result = calculateNextPollingInterval(5000, 0, 3000);

      expect(result).toBe(3000);
    });

    it("should handle very high consecutive empty polls", () => {
      const result = calculateNextPollingInterval(5000, 1000, 3000);

      expect(result).toBeLessThanOrEqual(MAX_INTERVAL);
    });

    it("should handle zero platform recommended interval", () => {
      const result = calculateNextPollingInterval(5000, 0, 0);

      expect(result).toBe(MIN_INTERVAL);
    });

    it("should handle negative platform recommended interval", () => {
      const result = calculateNextPollingInterval(5000, 0, -1000);

      expect(result).toBe(MIN_INTERVAL);
    });
  });
});

describe("isChatActive", () => {
  const { ACTIVE_THRESHOLD } = POLLING_CONFIG;

  it("should return true when no empty polls", () => {
    expect(isChatActive(0)).toBe(true);
  });

  it("should return true when below threshold", () => {
    expect(isChatActive(ACTIVE_THRESHOLD - 1)).toBe(true);
  });

  it("should return false when at threshold", () => {
    expect(isChatActive(ACTIVE_THRESHOLD)).toBe(false);
  });

  it("should return false when above threshold", () => {
    expect(isChatActive(ACTIVE_THRESHOLD + 10)).toBe(false);
  });
});
