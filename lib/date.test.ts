import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatDistanceToNow } from "./date";

describe("formatDistanceToNow", () => {
  beforeEach(() => {
    // Mock Date.now() to have consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("seconds ago", () => {
    it("should return 'just now' for 0 seconds ago", () => {
      const date = new Date("2024-06-15T12:00:00Z");
      expect(formatDistanceToNow(date)).toBe("just now");
    });

    it("should return 'just now' for 30 seconds ago", () => {
      const date = new Date("2024-06-15T11:59:30Z");
      expect(formatDistanceToNow(date)).toBe("just now");
    });

    it("should return 'just now' for 59 seconds ago", () => {
      const date = new Date("2024-06-15T11:59:01Z");
      expect(formatDistanceToNow(date)).toBe("just now");
    });
  });

  describe("minutes ago", () => {
    it("should return '1 minute ago' for 60 seconds ago", () => {
      const date = new Date("2024-06-15T11:59:00Z");
      expect(formatDistanceToNow(date)).toBe("1 minute ago");
    });

    it("should return '1 minute ago' for 90 seconds ago", () => {
      const date = new Date("2024-06-15T11:58:30Z");
      expect(formatDistanceToNow(date)).toBe("1 minute ago");
    });

    it("should return '2 minutes ago' for 2 minutes ago", () => {
      const date = new Date("2024-06-15T11:58:00Z");
      expect(formatDistanceToNow(date)).toBe("2 minutes ago");
    });

    it("should return '59 minutes ago' for 59 minutes ago", () => {
      const date = new Date("2024-06-15T11:01:00Z");
      expect(formatDistanceToNow(date)).toBe("59 minutes ago");
    });
  });

  describe("hours ago", () => {
    it("should return '1 hour ago' for 60 minutes ago", () => {
      const date = new Date("2024-06-15T11:00:00Z");
      expect(formatDistanceToNow(date)).toBe("1 hour ago");
    });

    it("should return '1 hour ago' for 90 minutes ago", () => {
      const date = new Date("2024-06-15T10:30:00Z");
      expect(formatDistanceToNow(date)).toBe("1 hour ago");
    });

    it("should return '2 hours ago' for 2 hours ago", () => {
      const date = new Date("2024-06-15T10:00:00Z");
      expect(formatDistanceToNow(date)).toBe("2 hours ago");
    });

    it("should return '23 hours ago' for 23 hours ago", () => {
      const date = new Date("2024-06-14T13:00:00Z");
      expect(formatDistanceToNow(date)).toBe("23 hours ago");
    });
  });

  describe("days ago", () => {
    it("should return '1 day ago' for 24 hours ago", () => {
      const date = new Date("2024-06-14T12:00:00Z");
      expect(formatDistanceToNow(date)).toBe("1 day ago");
    });

    it("should return '1 day ago' for 36 hours ago", () => {
      const date = new Date("2024-06-14T00:00:00Z");
      expect(formatDistanceToNow(date)).toBe("1 day ago");
    });

    it("should return '2 days ago' for 48 hours ago", () => {
      const date = new Date("2024-06-13T12:00:00Z");
      expect(formatDistanceToNow(date)).toBe("2 days ago");
    });

    it("should return '29 days ago' for 29 days ago", () => {
      const date = new Date("2024-05-17T12:00:00Z");
      expect(formatDistanceToNow(date)).toBe("29 days ago");
    });
  });

  describe("months ago", () => {
    it("should return '1 month ago' for 30 days ago", () => {
      const date = new Date("2024-05-16T12:00:00Z");
      expect(formatDistanceToNow(date)).toBe("1 month ago");
    });

    it("should return '2 months ago' for 60 days ago", () => {
      const date = new Date("2024-04-16T12:00:00Z");
      expect(formatDistanceToNow(date)).toBe("2 months ago");
    });

    it("should return '6 months ago' for 180 days ago", () => {
      const date = new Date("2023-12-18T12:00:00Z");
      expect(formatDistanceToNow(date)).toBe("6 months ago");
    });

    it("should return '12 months ago' for a year ago", () => {
      const date = new Date("2023-06-15T12:00:00Z");
      expect(formatDistanceToNow(date)).toBe("12 months ago");
    });
  });

  describe("edge cases", () => {
    it("should handle future dates (returns negative-ish 'just now')", () => {
      const futureDate = new Date("2024-06-15T12:00:01Z");
      // Function doesn't handle future dates specially, will return "just now"
      expect(formatDistanceToNow(futureDate)).toBe("just now");
    });

    it("should handle very old dates", () => {
      const oldDate = new Date("2020-01-01T00:00:00Z");
      const result = formatDistanceToNow(oldDate);
      expect(result).toMatch(/\d+ months? ago/);
    });
  });
});
