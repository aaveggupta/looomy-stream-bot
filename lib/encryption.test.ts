import { describe, it, expect, beforeAll } from "vitest";

// Mock the environment variable before importing the module
beforeAll(() => {
  process.env.ENCRYPTION_KEY = "test-encryption-key-for-unit-tests-32chars";
});

import { encrypt, decrypt, isEncrypted, safeDecrypt, decryptIfEncrypted } from "./encryption";

describe("encryption", () => {
  describe("encrypt and decrypt", () => {
    it("should encrypt and decrypt a simple string", () => {
      const plaintext = "hello world";
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should encrypt and decrypt a refresh token", () => {
      const refreshToken = "1//0abc123_XYZ-refresh-token-example";
      const encrypted = encrypt(refreshToken);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(refreshToken);
    });

    it("should encrypt and decrypt unicode characters", () => {
      const plaintext = "Hello 世界 🌍";
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should produce different ciphertext for same plaintext (random IV)", () => {
      const plaintext = "same text";
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
      expect(decrypt(encrypted1)).toBe(plaintext);
      expect(decrypt(encrypted2)).toBe(plaintext);
    });

    it("should handle empty string", () => {
      const plaintext = "";
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should handle long strings", () => {
      const plaintext = "a".repeat(10000);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe("isEncrypted", () => {
    it("should return true for encrypted values", () => {
      const encrypted = encrypt("test");
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it("should return false for plaintext refresh tokens", () => {
      // Typical YouTube refresh token format
      const plainToken = "1//0abc123-XYZ_refresh-token";
      expect(isEncrypted(plainToken)).toBe(false);
    });

    it("should return false for short strings", () => {
      expect(isEncrypted("short")).toBe(false);
    });

    it("should return false for non-base64 strings", () => {
      expect(isEncrypted("not-valid-base64!@#$")).toBe(false);
    });

    it("should return false for base64 that is too short", () => {
      // Valid base64 but too short to be our encrypted format
      expect(isEncrypted("YWJjZGVm")).toBe(false);
    });
  });

  describe("safeDecrypt", () => {
    it("should return decrypted value for valid encrypted string", () => {
      const plaintext = "secret";
      const encrypted = encrypt(plaintext);

      expect(safeDecrypt(encrypted)).toBe(plaintext);
    });

    it("should return null for invalid encrypted string", () => {
      expect(safeDecrypt("not-encrypted")).toBe(null);
    });

    it("should return null for corrupted encrypted string", () => {
      const encrypted = encrypt("test");
      const corrupted = encrypted.slice(0, -5) + "XXXXX";

      expect(safeDecrypt(corrupted)).toBe(null);
    });
  });

  describe("decryptIfEncrypted", () => {
    it("should decrypt encrypted values", () => {
      const plaintext = "my-token";
      const encrypted = encrypt(plaintext);

      expect(decryptIfEncrypted(encrypted)).toBe(plaintext);
    });

    it("should return plaintext values unchanged", () => {
      const plainToken = "1//0abc123-not-encrypted";

      expect(decryptIfEncrypted(plainToken)).toBe(plainToken);
    });

    it("should handle migration scenario - mix of encrypted and plain tokens", () => {
      const plainToken1 = "1//plain-token-1";
      const plainToken2 = "1//plain-token-2";
      const encryptedToken = encrypt("encrypted-secret");

      // Plain tokens should pass through
      expect(decryptIfEncrypted(plainToken1)).toBe(plainToken1);
      expect(decryptIfEncrypted(plainToken2)).toBe(plainToken2);

      // Encrypted should be decrypted
      expect(decryptIfEncrypted(encryptedToken)).toBe("encrypted-secret");
    });
  });

  describe("security properties", () => {
    it("should fail to decrypt with wrong data", () => {
      const encrypted = encrypt("secret");
      const tampered = Buffer.from(encrypted, "base64");
      // Flip a bit in the ciphertext
      tampered[tampered.length - 1] ^= 0xff;
      const tamperedStr = tampered.toString("base64");

      expect(() => decrypt(tamperedStr)).toThrow();
    });

    it("should produce base64 output", () => {
      const encrypted = encrypt("test");
      const base64Regex = /^[A-Za-z0-9+/]+=*$/;

      expect(base64Regex.test(encrypted)).toBe(true);
    });
  });
});
