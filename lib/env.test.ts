import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { validateEnv, getRequiredEnv } from "./env";

describe("validateEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should not throw when all required env vars are set", () => {
    process.env.OPENAI_API_KEY = "test-openai-key";
    process.env.PINECONE_API_KEY = "test-pinecone-key";
    process.env.PINECONE_INDEX = "test-index";
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/callback";
    process.env.BOT_YOUTUBE_REFRESH_TOKEN = "test-refresh-token";
    process.env.BOT_POLL_SECRET = "test-poll-secret";
    process.env.ENCRYPTION_KEY = "test-encryption-key";

    expect(() => validateEnv()).not.toThrow();
  });

  it("should throw when OPENAI_API_KEY is missing", () => {
    process.env.PINECONE_API_KEY = "test-pinecone-key";
    process.env.PINECONE_INDEX = "test-index";
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/callback";
    process.env.BOT_YOUTUBE_REFRESH_TOKEN = "test-refresh-token";
    process.env.BOT_POLL_SECRET = "test-poll-secret";
    process.env.ENCRYPTION_KEY = "test-encryption-key";
    delete process.env.OPENAI_API_KEY;

    expect(() => validateEnv()).toThrow("OPENAI_API_KEY");
  });

  it("should throw when multiple env vars are missing", () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.PINECONE_API_KEY;
    delete process.env.ENCRYPTION_KEY;

    expect(() => validateEnv()).toThrow(/OPENAI_API_KEY/);
    expect(() => validateEnv()).toThrow(/PINECONE_API_KEY/);
    expect(() => validateEnv()).toThrow(/ENCRYPTION_KEY/);
  });

  it("should include helpful message in error", () => {
    delete process.env.OPENAI_API_KEY;

    expect(() => validateEnv()).toThrow("Please check your .env file");
  });

  it("should treat empty string as missing", () => {
    process.env.OPENAI_API_KEY = "";
    process.env.PINECONE_API_KEY = "test";
    process.env.PINECONE_INDEX = "test";
    process.env.GOOGLE_CLIENT_ID = "test";
    process.env.GOOGLE_CLIENT_SECRET = "test";
    process.env.GOOGLE_REDIRECT_URI = "test";
    process.env.BOT_YOUTUBE_REFRESH_TOKEN = "test";
    process.env.BOT_POLL_SECRET = "test";
    process.env.ENCRYPTION_KEY = "test";

    expect(() => validateEnv()).toThrow("OPENAI_API_KEY");
  });
});

describe("getRequiredEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should return value when env var exists", () => {
    process.env.TEST_VAR = "test-value";

    expect(getRequiredEnv("TEST_VAR")).toBe("test-value");
  });

  it("should throw when env var is missing", () => {
    delete process.env.MISSING_VAR;

    expect(() => getRequiredEnv("MISSING_VAR")).toThrow(
      "Required environment variable MISSING_VAR is not set"
    );
  });

  it("should throw when env var is empty string", () => {
    process.env.EMPTY_VAR = "";

    expect(() => getRequiredEnv("EMPTY_VAR")).toThrow(
      "Required environment variable EMPTY_VAR is not set"
    );
  });

  it("should return value with special characters", () => {
    process.env.SPECIAL_VAR = "value-with-special!@#$%^&*()chars";

    expect(getRequiredEnv("SPECIAL_VAR")).toBe("value-with-special!@#$%^&*()chars");
  });

  it("should return value with spaces", () => {
    process.env.SPACE_VAR = "value with spaces";

    expect(getRequiredEnv("SPACE_VAR")).toBe("value with spaces");
  });

  it("should return numeric string as string", () => {
    process.env.NUMBER_VAR = "12345";

    expect(getRequiredEnv("NUMBER_VAR")).toBe("12345");
    expect(typeof getRequiredEnv("NUMBER_VAR")).toBe("string");
  });
});
