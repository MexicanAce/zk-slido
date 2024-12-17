const ENCRYPTED_CONTENT_SENTINEL = 'encrypted://'

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    const byteHex = bytes[i].toString(16).padStart(2, '0');
    hex += byteHex;
  }
  return hex;
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const length = hex.length / 2;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}

function isContentEncrypted(content: string): boolean {
  return content.startsWith(ENCRYPTED_CONTENT_SENTINEL);
}

/**
 * Encrypt a plaintext string using an Ethereum private key as the AES-256-GCM key.
 * Returns a single string that contains both IV and ciphertext.
 */
export async function encryptWithPrivateKey(privateKeyHex: string, plaintext: string): Promise<string> {
  // Strip '0x' if present
  const keyHex = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
  const keyBuffer = hexToArrayBuffer(keyHex);

  if (keyBuffer.byteLength !== 32) {
    throw new Error('Invalid key length. Must be 32 bytes for AES-256.');
  }

  // Import the key for AES-GCM
  const key = await window.crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM", length: 256 },
    false, // non-extractable
    ["encrypt", "decrypt"]
  );

  // Create a random 12-byte IV for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Encrypt the data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  // Convert to hex
  const ivHex = arrayBufferToHex(iv.buffer);
  const ciphertextHex = arrayBufferToHex(encryptedBuffer);

  // Return a single string "iv:ciphertext"
  return `${ENCRYPTED_CONTENT_SENTINEL}${ivHex}:${ciphertextHex}`;
}

/**
 * Decrypt the previously encrypted string using the same private key.
 */
export async function decryptWithPrivateKey(privateKeyHex: string, combined: string): Promise<string> {
  // Backwards support for unencrypted messages
  if (!isContentEncrypted(combined)) {
    return combined;
  } else {
    combined = combined.replace(ENCRYPTED_CONTENT_SENTINEL, '');
  }

  const [ivHex, ciphertextHex] = combined.split(':');
  const ivBuffer = hexToArrayBuffer(ivHex);
  const ciphertextBuffer = hexToArrayBuffer(ciphertextHex);

  const keyHex = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
  const keyBuffer = hexToArrayBuffer(keyHex);

  if (keyBuffer.byteLength !== 32) {
    throw new Error('Invalid key length. Must be 32 bytes for AES-256.');
  }

  // Import the key again for decryption
  const key = await window.crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  // Decrypt
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
    key,
    ciphertextBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}