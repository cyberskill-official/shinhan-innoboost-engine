// engine/crypto/field-encryption.ts
// Application-layer field encryption for PII — Implements P01-T08
// AES-256-GCM with per-field IV; key sourced from KMS.

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns base64-encoded ciphertext with IV and auth tag prepended.
 *
 * Format: base64(IV || AuthTag || Ciphertext)
 *
 * @param plaintext - The string to encrypt
 * @param key - 256-bit encryption key (from KMS)
 * @returns base64-encoded encrypted payload
 */
export function encryptField(plaintext: string, key: Buffer): string {
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes, got ${key.length}`);
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Prepend IV + Tag for self-describing ciphertext
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypt a base64-encoded ciphertext produced by encryptField.
 *
 * @param ciphertext - base64-encoded encrypted payload
 * @param key - 256-bit encryption key (from KMS)
 * @returns decrypted plaintext string
 */
export function decryptField(ciphertext: string, key: Buffer): string {
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes, got ${key.length}`);
  }

  const data = Buffer.from(ciphertext, 'base64');

  if (data.length < IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error('Invalid ciphertext: too short');
  }

  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Hash a value for indexing (when you need to search encrypted fields).
 * Uses HMAC-SHA256 so the hash is keyed and not reversible.
 *
 * @param value - The value to hash
 * @param key - HMAC key (different from encryption key)
 * @returns hex-encoded HMAC digest
 */
export function hashForIndex(value: string, key: Buffer): string {
  const { createHmac } = require('node:crypto') as typeof import('node:crypto');
  return createHmac('sha256', key).update(value).digest('hex');
}

/**
 * Fields that require encryption before DB write.
 * Used by the ORM middleware to auto-encrypt/decrypt.
 */
export const ENCRYPTED_FIELDS = {
  User: ['email', 'phone'],
  Query: ['rawQuery', 'userContext'],
  AuditLog: ['actorContext', 'targetData'],
} as const;
