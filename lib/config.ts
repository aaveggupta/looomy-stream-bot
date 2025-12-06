/**
 * Application configuration constants
 * Centralizes all magic strings and hard-coded values
 */

// OpenAI Configuration
export const OPENAI_CONFIG = {
  CHAT_MODEL: "gpt-4o-mini",
  EMBEDDING_MODEL: "text-embedding-3-small",
  MAX_TOKENS: 50,
  TEMPERATURE: 0.7,
} as const;

// Text Chunking Configuration
export const CHUNK_CONFIG = {
  DEFAULT_CHUNK_SIZE: 1000,
  DEFAULT_OVERLAP: 200,
} as const;

// YouTube/Platform Configuration
export const PLATFORM_CONFIG = {
  MAX_MESSAGE_LENGTH: 200,
  MESSAGE_TRUNCATE_SUFFIX: "...",
  TRUNCATE_LENGTH: 197, // 200 - 3 for "..."
} as const;

// Pinecone Configuration
export const PINECONE_CONFIG = {
  DEFAULT_TOP_K: 3,
} as const;

// Polling Configuration
export const POLLING_CONFIG = {
  MIN_INTERVAL: 2000, // 2 seconds
  MAX_INTERVAL: 30000, // 30 seconds
  IDLE_MULTIPLIER: 4,
  ACTIVE_THRESHOLD: 3,
} as const;

// API Timeout Configuration (in milliseconds)
export const TIMEOUT_CONFIG = {
  OPENAI: 30000, // 30 seconds
  PINECONE: 10000, // 10 seconds
  YOUTUBE: 15000, // 15 seconds
  DEFAULT: 10000, // 10 seconds
} as const;
