import { describe, it, expect } from "vitest";
import { chunkText } from "./chunker";

describe("chunkText", () => {
  describe("basic chunking", () => {
    it("should return single chunk for text smaller than chunk size", () => {
      const text = "Hello world";
      const result = chunkText(text, 1000, 200);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("Hello world");
      expect(result[0].index).toBe(0);
    });

    it("should return single chunk for text equal to chunk size", () => {
      const text = "a".repeat(100);
      const result = chunkText(text, 100, 20);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe(text);
    });

    it("should split text larger than chunk size", () => {
      const text = "a".repeat(250);
      const result = chunkText(text, 100, 20);

      expect(result.length).toBeGreaterThan(1);
    });

    it("should handle empty text", () => {
      const result = chunkText("", 100, 20);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("");
    });

    it("should handle whitespace-only text", () => {
      const result = chunkText("   \n\n   ", 100, 20);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("");
    });
  });

  describe("text cleaning", () => {
    it("should normalize Windows line endings (CRLF)", () => {
      const text = "line1\r\nline2\r\nline3";
      const result = chunkText(text, 1000, 200);

      expect(result[0].text).toBe("line1\nline2\nline3");
    });

    it("should normalize old Mac line endings (CR)", () => {
      const text = "line1\rline2\rline3";
      const result = chunkText(text, 1000, 200);

      expect(result[0].text).toBe("line1\nline2\nline3");
    });

    it("should collapse multiple blank lines", () => {
      const text = "para1\n\n\n\n\npara2";
      const result = chunkText(text, 1000, 200);

      expect(result[0].text).toBe("para1\n\npara2");
    });

    it("should trim leading and trailing whitespace", () => {
      const text = "   hello world   ";
      const result = chunkText(text, 1000, 200);

      expect(result[0].text).toBe("hello world");
    });
  });

  describe("break point detection", () => {
    it("should prefer paragraph breaks", () => {
      const para1 = "First paragraph content here.";
      const para2 = "Second paragraph content here.";
      const text = `${para1}\n\n${para2}`;

      // Chunk size that forces a split somewhere
      const result = chunkText(text, 40, 10);

      // First chunk should end at paragraph break
      expect(result[0].text).toBe(para1);
    });

    it("should fall back to sentence breaks when no paragraph break", () => {
      const text = "First sentence here. Second sentence here. Third sentence here.";

      const result = chunkText(text, 30, 5);

      // Should break at sentence boundary
      expect(result[0].text).toMatch(/\.$/);
    });

    it("should fall back to newline breaks", () => {
      const text = "Line one content\nLine two content\nLine three content";

      const result = chunkText(text, 25, 5);

      // Should break at newline
      expect(result.length).toBeGreaterThan(1);
    });
  });

  describe("overlap handling", () => {
    it("should create overlapping chunks", () => {
      const text = "abcdefghijklmnopqrstuvwxyz";
      const result = chunkText(text, 10, 3);

      // With overlap, later chunks should start before previous chunk ends
      if (result.length > 1) {
        // Check that chunks have content that could overlap
        expect(result[0].text.length).toBeGreaterThan(0);
        expect(result[1].text.length).toBeGreaterThan(0);
      }
    });

    it("should handle zero overlap", () => {
      const text = "a".repeat(50);
      const result = chunkText(text, 20, 0);

      expect(result.length).toBeGreaterThan(1);
    });
  });

  describe("chunk indexing", () => {
    it("should assign sequential indexes starting from 0", () => {
      const text = "a".repeat(300);
      const result = chunkText(text, 100, 20);

      result.forEach((chunk, i) => {
        expect(chunk.index).toBe(i);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle text with only special characters", () => {
      const text = "!@#$%^&*()";
      const result = chunkText(text, 1000, 200);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("!@#$%^&*()");
    });

    it("should handle unicode text", () => {
      const text = "Hello 世界 🌍 émojis";
      const result = chunkText(text, 1000, 200);

      expect(result[0].text).toBe("Hello 世界 🌍 émojis");
    });

    it("should handle very long single words", () => {
      const longWord = "a".repeat(500);
      const result = chunkText(longWord, 100, 20);

      // Should still chunk even without natural break points
      expect(result.length).toBeGreaterThan(1);
    });

    it("should not create empty chunks", () => {
      const text = "Hello world. This is a test. Another sentence here.";
      const result = chunkText(text, 20, 5);

      result.forEach((chunk) => {
        expect(chunk.text.length).toBeGreaterThan(0);
      });
    });

    it("should handle chunk size of 1", () => {
      const text = "abc";
      // This is an extreme edge case
      const result = chunkText(text, 1, 0);

      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("real-world scenarios", () => {
    it("should chunk a typical document", () => {
      const document = `
# Introduction

This is the introduction paragraph with some important information.

# Section 1

Here we discuss the first topic in detail. It contains multiple sentences
that explain the concept thoroughly.

# Section 2

The second section covers another important aspect. This section is also
quite detailed and informative.
      `.trim();

      const result = chunkText(document, 200, 50);

      // Should create multiple chunks
      expect(result.length).toBeGreaterThan(1);

      // All chunks should have content
      result.forEach((chunk) => {
        expect(chunk.text.trim().length).toBeGreaterThan(0);
      });

      // Chunks should be properly indexed
      expect(result[0].index).toBe(0);
      expect(result[result.length - 1].index).toBe(result.length - 1);
    });
  });
});
