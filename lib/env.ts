/**
 * Environment variable validation
 * Fails fast on startup if required environment variables are missing
 */

const requiredEnvVars = [
  "OPENAI_API_KEY",
  "PINECONE_API_KEY",
  "PINECONE_INDEX",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
  "BOT_YOUTUBE_REFRESH_TOKEN",
  "BOT_POLL_SECRET",
] as const;

const optionalEnvVars = ["LOG_LEVEL", "CLERK_WEBHOOK_SECRET"] as const;

/**
 * Validates that all required environment variables are set
 * @throws Error if any required env var is missing
 */
export function validateEnv(): void {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env file or environment configuration."
    );
  }
}

/**
 * Get an environment variable, throwing if it's missing
 * Use this instead of non-null assertions for better error messages
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get an optional environment variable with a default value
 */
export function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}
