import { Buffer } from "buffer";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import config from "../config";

/*
 * Encryption at rest for private values (client project env variables).
 * AES-256-GCM with a key from DATA_ENCRYPTION_KEY. Stored format:
 *   enc:v1:<iv>:<auth tag>:<ciphertext>   (base64 parts)
 * Losing or changing the key makes stored values unreadable - back it up.
 */

const PREFIX = "enc:v1:";

export const isSecretBoxConfigured = () => Boolean(config.data_encryption_key);

const key = () => createHash("sha256").update(config.data_encryption_key).digest();

export const isSealed = (value?: string) => typeof value === "string" && value.startsWith(PREFIX);

export const seal = (plain: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `${PREFIX}${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${encrypted.toString("base64")}`;
};

// Throws when the key is missing or wrong (the auth tag check fails)
export const open = (sealed: string) => {
  const [iv, tag, data] = sealed.slice(PREFIX.length).split(":");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
};
