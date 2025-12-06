import crypto from "crypto";
import { getRequiredEnv } from "./env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Derives a 256-bit key from the encryption key using PBKDF2
 * This ensures the key is always the correct length regardless of input
 */
function deriveKey(salt: Buffer): Buffer {
  const encryptionKey = getRequiredEnv("ENCRYPTION_KEY");
  return crypto.pbkdf2Sync(encryptionKey, salt, 100000, 32, "sha256");
}

/**
 * Encrypts a plaintext string using AES-256-GCM
 * Returns a base64-encoded string containing: salt + iv + authTag + ciphertext
 *
 * @param plaintext - The string to encrypt
 * @returns Base64-encoded encrypted string
 */
export function encrypt(plaintext: string): string {
  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derive key from encryption key + salt
  const key = deriveKey(salt);

  // Create cipher and encrypt
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  // Get auth tag for GCM mode
  const authTag = cipher.getAuthTag();

  // Combine all parts: salt + iv + authTag + ciphertext
  const combined = Buffer.concat([salt, iv, authTag, encrypted]);

  return combined.toString("base64");
}

/**
 * Decrypts a base64-encoded encrypted string
 *
 * @param encryptedBase64 - Base64-encoded string from encrypt()
 * @returns The original plaintext string
 * @throws Error if decryption fails (wrong key, tampered data, etc.)
 */
export function decrypt(encryptedBase64: string): string {
  const combined = Buffer.from(encryptedBase64, "base64");

  // Extract parts
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );
  const ciphertext = combined.subarray(
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );

  // Derive key from encryption key + salt
  const key = deriveKey(salt);

  // Create decipher and decrypt
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Check if a string appears to be encrypted (base64 with correct length)
 * This helps with migration - we can check if a token is already encrypted
 *
 * @param value - The string to check
 * @returns true if the value appears to be encrypted
 */
export function isEncrypted(value: string): boolean {
  // Encrypted values are base64 and have minimum length for salt + iv + authTag
  const minLength = (SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH + 1) * 4 / 3;

  // Check if it's valid base64
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  if (!base64Regex.test(value)) {
    return false;
  }

  // Check minimum length
  if (value.length < minLength) {
    return false;
  }

  // Try to decode and check structure
  try {
    const decoded = Buffer.from(value, "base64");
    // Should have at least salt + iv + authTag + 1 byte of ciphertext
    return decoded.length >= SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH + 1;
  } catch {
    return false;
  }
}

/**
 * Safely decrypt a value, returning null if decryption fails
 * Useful for migration scenarios where some values may not be encrypted
 *
 * @param value - The potentially encrypted value
 * @returns Decrypted string or null if decryption fails
 */
export function safeDecrypt(value: string): string | null {
  try {
    return decrypt(value);
  } catch {
    return null;
  }
}

/**
 * Decrypt a token that might be encrypted or plaintext (for migration)
 * First tries to decrypt, if that fails returns the original value
 *
 * @param value - The value that might be encrypted
 * @returns The decrypted value or original if not encrypted
 */
export function decryptIfEncrypted(value: string): string {
  if (!isEncrypted(value)) {
    return value;
  }

  const decrypted = safeDecrypt(value);
  return decrypted ?? value;
}
