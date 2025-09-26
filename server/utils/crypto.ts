import crypto from "node:crypto";

const SLOT_SECONDS = 30;
const GRACE_SLOTS = 1;

function strToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bytesToStr(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

async function hmacSha256(key: string, data: string): Promise<Uint8Array> {
  const keyBuffer = Buffer.from(key, "utf8");
  const dataBuffer = Buffer.from(data, "utf8");

  const hmac = crypto.createHmac("sha256", keyBuffer);
  hmac.update(dataBuffer);
  const macBuffer = hmac.digest(); // Returns Buffer (which is Uint8Array subclass)

  return new Uint8Array(macBuffer); // Explicitly cast to Uint8Array for consistency
}

function cryptoRandomBase64(length: number): string {
  const bytes = crypto.randomBytes(length);
  return bytes.toString("base64");
}

async function puzzleForSlot(
  sharedKey: string,
  slot: number,
  input: string
): Promise<string> {
  const data = slot.toString() + ":" + input;
  const mac = await hmacSha256(sharedKey, data);

  // Use first 8 bytes for 64-bit entropy (instead of 4)
  let value = 0n;
  for (let i = 0; i < 8; i++) {
    value = (value << 8n) | BigInt(mac[i]);
  }
  // Convert BigInt to hex string (lowercase, padded)
  const hex = value.toString(16);
  return hex.padStart(16, "0"); // 16 chars

  //   const value = (mac[0] << 24) | (mac[1] << 16) | (mac[2] << 8) | mac[3];
  //   return value.toString(16).padStart(8, '0');
}

export {
  SLOT_SECONDS,
  GRACE_SLOTS,
  strToBytes,
  bytesToStr,
  hmacSha256,
  cryptoRandomBase64,
  puzzleForSlot,
};
