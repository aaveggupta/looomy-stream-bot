/**
 * Unit tests for message-queue utilities
 *
 * Tests all edge cases for message filtering and tracking logic
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  filterNewMessages,
  MessageTracker,
  processLiveChatMessages,
  type Message,
  type YouTubeLiveChatMessage,
} from "./message-queue";

// Helper to create test messages
function createMessages(count: number, startId: number = 1): Message[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${startId + i}`,
    text: `Message ${startId + i}`,
  }));
}

describe("filterNewMessages", () => {
  describe("Edge Case: Empty messages array", () => {
    it("should handle empty array with no lastProcessedId", () => {
      const result = filterNewMessages([], null);

      expect(result.messagesToProcess).toEqual([]);
      expect(result.lastSeenMessageId).toBeNull();
      expect(result.totalMessages).toBe(0);
      expect(result.skippedMessages).toBe(0);
    });

    it("should handle empty array with lastProcessedId", () => {
      const result = filterNewMessages([], "msg-5");

      expect(result.messagesToProcess).toEqual([]);
      expect(result.lastSeenMessageId).toBeNull();
      expect(result.totalMessages).toBe(0);
      expect(result.skippedMessages).toBe(0);
    });
  });

  describe("Edge Case: First run (no lastProcessedId)", () => {
    it("should process all messages on first run", () => {
      const messages = createMessages(5);
      const result = filterNewMessages(messages, null);

      expect(result.messagesToProcess).toEqual(messages);
      expect(result.lastSeenMessageId).toBe("msg-5");
      expect(result.totalMessages).toBe(5);
      expect(result.skippedMessages).toBe(0);
    });

    it("should process single message on first run", () => {
      const messages = createMessages(1);
      const result = filterNewMessages(messages, null);

      expect(result.messagesToProcess).toEqual(messages);
      expect(result.lastSeenMessageId).toBe("msg-1");
      expect(result.totalMessages).toBe(1);
      expect(result.skippedMessages).toBe(0);
    });
  });

  describe("Edge Case: lastProcessedId found in messages", () => {
    it("should skip messages up to and including lastProcessedId", () => {
      const messages = createMessages(5);
      const result = filterNewMessages(messages, "msg-2");

      expect(result.messagesToProcess).toHaveLength(3);
      expect(result.messagesToProcess.map((m) => m.id)).toEqual([
        "msg-3",
        "msg-4",
        "msg-5",
      ]);
      expect(result.lastSeenMessageId).toBe("msg-5");
      expect(result.totalMessages).toBe(5);
      expect(result.skippedMessages).toBe(2);
    });

    it("should process nothing if lastProcessedId is the last message", () => {
      const messages = createMessages(5);
      const result = filterNewMessages(messages, "msg-5");

      expect(result.messagesToProcess).toEqual([]);
      expect(result.lastSeenMessageId).toBe("msg-5");
      expect(result.totalMessages).toBe(5);
      expect(result.skippedMessages).toBe(5);
    });

    it("should process all but first if lastProcessedId is first", () => {
      const messages = createMessages(5);
      const result = filterNewMessages(messages, "msg-1");

      expect(result.messagesToProcess).toHaveLength(4);
      expect(result.messagesToProcess.map((m) => m.id)).toEqual([
        "msg-2",
        "msg-3",
        "msg-4",
        "msg-5",
      ]);
      expect(result.lastSeenMessageId).toBe("msg-5");
      expect(result.totalMessages).toBe(5);
      expect(result.skippedMessages).toBe(1);
    });
  });

  describe("Edge Case: lastProcessedId NOT found (critical for bug fix)", () => {
    it("should process ALL messages if lastProcessedId not found", () => {
      const messages = createMessages(5, 10); // msg-10 to msg-14
      const result = filterNewMessages(messages, "msg-5"); // msg-5 not in batch

      // This is the KEY FIX: if old message not found, process ALL current messages
      expect(result.messagesToProcess).toEqual(messages);
      expect(result.messagesToProcess).toHaveLength(5);
      expect(result.lastSeenMessageId).toBe("msg-14");
      expect(result.totalMessages).toBe(5);
      expect(result.skippedMessages).toBe(0);
    });

    it("should handle multiple batches with gaps", () => {
      // Simulate: processed msg-5, then API returns msg-20-25 (huge gap)
      const messages = createMessages(5, 20);
      const result = filterNewMessages(messages, "msg-5");

      expect(result.messagesToProcess).toEqual(messages);
      expect(result.lastSeenMessageId).toBe("msg-24");
      expect(result.totalMessages).toBe(5);
      expect(result.skippedMessages).toBe(0);
    });
  });

  describe("Real-world scenario: Sequential batches", () => {
    it("should handle sequential message batches correctly", () => {
      // Batch 1: Process first 3 messages
      const batch1 = createMessages(3); // msg-1, msg-2, msg-3
      const result1 = filterNewMessages(batch1, null);
      expect(result1.messagesToProcess).toHaveLength(3);
      expect(result1.lastSeenMessageId).toBe("msg-3");

      // Batch 2: New messages arrive, some overlap
      const batch2 = createMessages(5, 2); // msg-2, msg-3, msg-4, msg-5, msg-6
      const result2 = filterNewMessages(batch2, result1.lastSeenMessageId);
      expect(result2.messagesToProcess).toHaveLength(3); // msg-4, msg-5, msg-6
      expect(result2.messagesToProcess.map((m) => m.id)).toEqual([
        "msg-4",
        "msg-5",
        "msg-6",
      ]);
      expect(result2.lastSeenMessageId).toBe("msg-6");

      // Batch 3: Same messages (no new messages)
      const batch3 = createMessages(3, 6); // msg-6, msg-7, msg-8
      const result3 = filterNewMessages(batch3, result2.lastSeenMessageId);
      expect(result3.messagesToProcess).toHaveLength(2); // msg-7, msg-8
      expect(result3.lastSeenMessageId).toBe("msg-8");
    });
  });

  describe("Real-world scenario: Bot restart (message tracking lost)", () => {
    it("should recover gracefully after losing tracking state", () => {
      // Bot was tracking msg-100, then restarted and lost state
      // Now new messages come in (msg-150-155)
      const messages = createMessages(5, 150);

      // Simulating: we lost tracking, so lastProcessedId from persistent store is old
      const result = filterNewMessages(messages, "msg-100");

      // Should process ALL current messages (recovery mode)
      expect(result.messagesToProcess).toEqual(messages);
      expect(result.lastSeenMessageId).toBe("msg-154");
    });
  });

  describe("Message type preservation", () => {
    it("should preserve custom message properties", () => {
      interface CustomMessage extends Message {
        text: string;
        authorName: string;
        timestamp: number;
      }

      const messages: CustomMessage[] = [
        { id: "1", text: "Hello", authorName: "Alice", timestamp: 1000 },
        { id: "2", text: "World", authorName: "Bob", timestamp: 2000 },
        { id: "3", text: "Test", authorName: "Charlie", timestamp: 3000 },
      ];

      const result = filterNewMessages(messages, "1");

      expect(result.messagesToProcess).toHaveLength(2);
      expect(result.messagesToProcess[0]).toEqual({
        id: "2",
        text: "World",
        authorName: "Bob",
        timestamp: 2000,
      });
      expect(result.messagesToProcess[1]).toEqual({
        id: "3",
        text: "Test",
        authorName: "Charlie",
        timestamp: 3000,
      });
    });
  });
});

describe("MessageTracker", () => {
  let tracker: MessageTracker;

  beforeEach(() => {
    tracker = new MessageTracker();
  });

  describe("Basic operations", () => {
    it("should return null for non-existent user", () => {
      expect(tracker.getLastProcessed("user-1")).toBeNull();
    });

    it("should store and retrieve last processed message", () => {
      tracker.setLastProcessed("user-1", "msg-5");
      expect(tracker.getLastProcessed("user-1")).toBe("msg-5");
    });

    it("should update existing tracking", () => {
      tracker.setLastProcessed("user-1", "msg-5");
      tracker.setLastProcessed("user-1", "msg-10");
      expect(tracker.getLastProcessed("user-1")).toBe("msg-10");
    });

    it("should track multiple users independently", () => {
      tracker.setLastProcessed("user-1", "msg-5");
      tracker.setLastProcessed("user-2", "msg-10");
      tracker.setLastProcessed("user-3", "msg-15");

      expect(tracker.getLastProcessed("user-1")).toBe("msg-5");
      expect(tracker.getLastProcessed("user-2")).toBe("msg-10");
      expect(tracker.getLastProcessed("user-3")).toBe("msg-15");
      expect(tracker.size()).toBe(3);
    });
  });

  describe("Clear operations", () => {
    it("should clear specific user tracking", () => {
      tracker.setLastProcessed("user-1", "msg-5");
      tracker.setLastProcessed("user-2", "msg-10");

      tracker.clear("user-1");

      expect(tracker.getLastProcessed("user-1")).toBeNull();
      expect(tracker.getLastProcessed("user-2")).toBe("msg-10");
      expect(tracker.size()).toBe(1);
    });

    it("should clear all tracking", () => {
      tracker.setLastProcessed("user-1", "msg-5");
      tracker.setLastProcessed("user-2", "msg-10");

      tracker.clearAll();

      expect(tracker.getLastProcessed("user-1")).toBeNull();
      expect(tracker.getLastProcessed("user-2")).toBeNull();
      expect(tracker.size()).toBe(0);
    });

    it("should handle clearing non-existent user", () => {
      tracker.clear("non-existent-user");
      expect(tracker.size()).toBe(0);
    });
  });

  describe("Integration: Tracker + filterNewMessages", () => {
    it("should work together for message processing workflow", () => {
      const userId = "user-123";

      // First batch
      const batch1 = createMessages(3);
      const result1 = filterNewMessages(
        batch1,
        tracker.getLastProcessed(userId)
      );
      expect(result1.messagesToProcess).toHaveLength(3);
      if (result1.lastSeenMessageId) {
        tracker.setLastProcessed(userId, result1.lastSeenMessageId);
      }

      // Second batch (with overlap)
      const batch2 = createMessages(5, 2);
      const result2 = filterNewMessages(
        batch2,
        tracker.getLastProcessed(userId)
      );
      expect(result2.messagesToProcess).toHaveLength(3); // msg-4, msg-5, msg-6
      if (result2.lastSeenMessageId) {
        tracker.setLastProcessed(userId, result2.lastSeenMessageId);
      }

      // Third batch (no overlap, gap in messages)
      const batch3 = createMessages(3, 10);
      const result3 = filterNewMessages(
        batch3,
        tracker.getLastProcessed(userId)
      );
      expect(result3.messagesToProcess).toHaveLength(3); // All new
      expect(result3.lastSeenMessageId).toBe("msg-12");
    });

    it("should handle multiple users with different message streams", () => {
      const user1 = "user-1";
      const user2 = "user-2";

      // User 1: Process messages 1-5
      const user1Batch1 = createMessages(5);
      const user1Result1 = filterNewMessages(
        user1Batch1,
        tracker.getLastProcessed(user1)
      );
      if (user1Result1.lastSeenMessageId) {
        tracker.setLastProcessed(user1, user1Result1.lastSeenMessageId);
      }

      // User 2: Process messages 10-15
      const user2Batch1 = createMessages(5, 10);
      const user2Result1 = filterNewMessages(
        user2Batch1,
        tracker.getLastProcessed(user2)
      );
      if (user2Result1.lastSeenMessageId) {
        tracker.setLastProcessed(user2, user2Result1.lastSeenMessageId);
      }

      // Verify independent tracking
      expect(tracker.getLastProcessed(user1)).toBe("msg-5");
      expect(tracker.getLastProcessed(user2)).toBe("msg-14");

      // User 1: New batch (msg-6, msg-7, msg-8 - all newer than msg-5)
      const user1Batch2 = createMessages(3, 6);
      const user1Result2 = filterNewMessages(
        user1Batch2,
        tracker.getLastProcessed(user1)
      );
      // msg-5 not in batch, so process ALL messages (recovery mode)
      expect(user1Result2.messagesToProcess).toHaveLength(3); // msg-6, msg-7, msg-8

      // User 2 tracking should be unchanged
      expect(tracker.getLastProcessed(user2)).toBe("msg-14");
    });
  });
});

// Helper to create YouTube-style live chat messages
function createYouTubeMessages(
  messages: Array<{ id: string; text: string; author?: string }>
): YouTubeLiveChatMessage[] {
  return messages.map((msg) => ({
    id: msg.id,
    snippet: {
      textMessageDetails: {
        messageText: msg.text,
      },
    },
    authorDetails: {
      displayName: msg.author || "TestUser",
    },
  }));
}

describe("processLiveChatMessages", () => {
  describe("Basic functionality", () => {
    it("should process messages with trigger phrase", () => {
      const messages = createYouTubeMessages([
        { id: "1", text: "@bot what is the weather?", author: "Alice" },
        { id: "2", text: "@bot how are you?", author: "Bob" },
      ]);

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply).toHaveLength(2);
      expect(result.messagesToReply[0]).toEqual({
        id: "1",
        question: "what is the weather?",
        authorName: "Alice",
        originalMessage: "@bot what is the weather?",
      });
      expect(result.messagesToReply[1]).toEqual({
        id: "2",
        question: "how are you?",
        authorName: "Bob",
        originalMessage: "@bot how are you?",
      });
      expect(result.totalMessages).toBe(2);
      expect(result.skippedMessages).toBe(0);
      expect(result.ignoredMessages).toBe(0);
    });

    it("should ignore messages without trigger phrase", () => {
      const messages = createYouTubeMessages([
        { id: "1", text: "@bot what is this?", author: "Alice" },
        { id: "2", text: "Just a regular message", author: "Bob" },
        { id: "3", text: "Another message", author: "Charlie" },
        { id: "4", text: "@bot tell me more", author: "Dave" },
      ]);

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply).toHaveLength(2);
      expect(result.messagesToReply[0].question).toBe("what is this?");
      expect(result.messagesToReply[1].question).toBe("tell me more");
      expect(result.ignoredMessages).toBe(2);
    });

    it("should handle case-insensitive trigger phrase", () => {
      const messages = createYouTubeMessages([
        { id: "1", text: "@BOT uppercase trigger", author: "Alice" },
        { id: "2", text: "@bot lowercase trigger", author: "Bob" },
        { id: "3", text: "@BoT mixed case trigger", author: "Charlie" },
      ]);

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply).toHaveLength(3);
      expect(result.messagesToReply[0].question).toBe("uppercase trigger");
      expect(result.messagesToReply[1].question).toBe("lowercase trigger");
      expect(result.messagesToReply[2].question).toBe("mixed case trigger");
    });

    it("should skip messages with only trigger phrase (no question)", () => {
      const messages = createYouTubeMessages([
        { id: "1", text: "@bot", author: "Alice" },
        { id: "2", text: "@bot help me", author: "Bob" },
        { id: "3", text: "@bot   ", author: "Charlie" }, // Just trigger + spaces
      ]);

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply).toHaveLength(1);
      expect(result.messagesToReply[0].question).toBe("help me");
      expect(result.ignoredMessages).toBe(2);
    });
  });

  describe("Author name formatting", () => {
    it("should remove @ prefix from author names", () => {
      const messages = createYouTubeMessages([
        { id: "1", text: "@bot question", author: "@Alice" },
        { id: "2", text: "@bot question", author: "Bob" },
      ]);

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply[0].authorName).toBe("Alice");
      expect(result.messagesToReply[1].authorName).toBe("Bob");
    });

    it("should handle missing author name", () => {
      const messages: YouTubeLiveChatMessage[] = [
        {
          id: "1",
          snippet: {
            textMessageDetails: {
              messageText: "@bot question",
            },
          },
          authorDetails: {}, // No displayName
        },
      ];

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply[0].authorName).toBe("User");
    });

    it("should handle completely missing authorDetails", () => {
      const messages: YouTubeLiveChatMessage[] = [
        {
          id: "1",
          snippet: {
            textMessageDetails: {
              messageText: "@bot question",
            },
          },
          // No authorDetails at all
        },
      ];

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply[0].authorName).toBe("User");
    });
  });

  describe("Question extraction", () => {
    it("should remove trigger phrase from beginning", () => {
      const messages = createYouTubeMessages([
        { id: "1", text: "@bot what is this?", author: "Alice" },
      ]);

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply[0].question).toBe("what is this?");
    });

    it("should remove trigger phrase from middle", () => {
      const messages = createYouTubeMessages([
        { id: "1", text: "hey @bot what is this?", author: "Alice" },
      ]);

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply[0].question).toBe("hey  what is this?");
    });

    it("should remove multiple occurrences of trigger phrase", () => {
      const messages = createYouTubeMessages([
        { id: "1", text: "@bot can you @bot help me?", author: "Alice" },
      ]);

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply[0].question).toBe("can you  help me?");
    });

    it("should trim whitespace from question", () => {
      const messages = createYouTubeMessages([
        { id: "1", text: "@bot   lots of spaces   ", author: "Alice" },
      ]);

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply[0].question).toBe("lots of spaces");
    });
  });

  describe("Integration with deduplication", () => {
    it("should skip already-processed messages", () => {
      const messages = createYouTubeMessages([
        { id: "1", text: "@bot first question", author: "Alice" },
        { id: "2", text: "@bot second question", author: "Bob" },
        { id: "3", text: "@bot third question", author: "Charlie" },
      ]);

      // Simulate: already processed up to message 1
      const result = processLiveChatMessages(messages, "1", "@bot");

      expect(result.messagesToReply).toHaveLength(2);
      expect(result.messagesToReply[0].question).toBe("second question");
      expect(result.messagesToReply[1].question).toBe("third question");
      expect(result.skippedMessages).toBe(1);
    });

    it("should handle deduplication + trigger filtering together", () => {
      const messages = createYouTubeMessages([
        { id: "1", text: "@bot first", author: "Alice" },
        { id: "2", text: "no trigger", author: "Bob" },
        { id: "3", text: "@bot second", author: "Charlie" },
        { id: "4", text: "also no trigger", author: "Dave" },
      ]);

      // Already processed message 1
      const result = processLiveChatMessages(messages, "1", "@bot");

      expect(result.messagesToReply).toHaveLength(1);
      expect(result.messagesToReply[0].question).toBe("second");
      expect(result.skippedMessages).toBe(1); // msg-1
      expect(result.ignoredMessages).toBe(2); // msg-2, msg-4
    });
  });

  describe("Edge cases", () => {
    it("should handle empty messages array", () => {
      const result = processLiveChatMessages([], null, "@bot");

      expect(result.messagesToReply).toEqual([]);
      expect(result.lastSeenMessageId).toBeNull();
      expect(result.totalMessages).toBe(0);
      expect(result.skippedMessages).toBe(0);
      expect(result.ignoredMessages).toBe(0);
    });

    it("should handle messages with missing text", () => {
      const messages: YouTubeLiveChatMessage[] = [
        {
          id: "1",
          snippet: {
            textMessageDetails: {}, // No messageText
          },
          authorDetails: {
            displayName: "Alice",
          },
        },
      ];

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply).toEqual([]);
      expect(result.ignoredMessages).toBe(1);
    });

    it("should handle messages with missing snippet", () => {
      const messages: YouTubeLiveChatMessage[] = [
        {
          id: "1",
          // No snippet at all
          authorDetails: {
            displayName: "Alice",
          },
        },
      ];

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply).toEqual([]);
      expect(result.ignoredMessages).toBe(1);
    });
  });

  describe("Real-world scenarios", () => {
    it("should handle a typical batch of mixed messages", () => {
      const messages = createYouTubeMessages([
        { id: "1", text: "Hello everyone!", author: "Alice" },
        { id: "2", text: "@bot what is AI?", author: "Bob" },
        { id: "3", text: "I agree with Bob", author: "Charlie" },
        { id: "4", text: "@bot", author: "Dave" }, // Just trigger
        { id: "5", text: "@bot explain machine learning", author: "Eve" },
        { id: "6", text: "Great stream!", author: "Frank" },
      ]);

      const result = processLiveChatMessages(messages, null, "@bot");

      expect(result.messagesToReply).toHaveLength(2);
      expect(result.messagesToReply[0].question).toBe("what is AI?");
      expect(result.messagesToReply[1].question).toBe("explain machine learning");
      expect(result.totalMessages).toBe(6);
      expect(result.ignoredMessages).toBe(4); // Alice, Charlie, Dave (no question), Frank
    });

    it("should handle sequential polling with tracker", () => {
      const tracker = new MessageTracker();
      const userId = "user-123";

      // First poll
      const batch1 = createYouTubeMessages([
        { id: "1", text: "@bot question 1", author: "Alice" },
        { id: "2", text: "random message", author: "Bob" },
        { id: "3", text: "@bot question 2", author: "Charlie" },
      ]);

      const result1 = processLiveChatMessages(
        batch1,
        tracker.getLastProcessed(userId),
        "@bot"
      );
      expect(result1.messagesToReply).toHaveLength(2);
      if (result1.lastSeenMessageId) {
        tracker.setLastProcessed(userId, result1.lastSeenMessageId);
      }

      // Second poll (with overlap)
      const batch2 = createYouTubeMessages([
        { id: "3", text: "@bot question 2", author: "Charlie" }, // Duplicate
        { id: "4", text: "@bot question 3", author: "Dave" },
        { id: "5", text: "another random", author: "Eve" },
      ]);

      const result2 = processLiveChatMessages(
        batch2,
        tracker.getLastProcessed(userId),
        "@bot"
      );
      expect(result2.messagesToReply).toHaveLength(1);
      expect(result2.messagesToReply[0].question).toBe("question 3");
      expect(result2.skippedMessages).toBe(1); // msg-3 already processed
    });
  });
});
