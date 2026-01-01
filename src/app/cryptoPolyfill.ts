/**
 * Browser polyfill for environments where `crypto.randomUUID` is missing.
 *
 * We need this because `@openai/agents-core`'s browser shim historically did:
 *   `crypto.randomUUID.bind(crypto)`
 * which throws if `randomUUID` is undefined.
 */

function uuidV4Fallback(): string {
  // RFC4122-ish v4 UUID generation.
  const bytes = new Uint8Array(16);
  const cryptoObj = globalThis.crypto;

  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function ensureCryptoRandomUUID() {
  // In some browsers / origins, crypto exists but randomUUID doesn't.
  const cryptoObj: Crypto | undefined = globalThis.crypto;
  if (!cryptoObj) return;

  const anyCrypto = cryptoObj as unknown as { randomUUID?: () => string };
  if (typeof anyCrypto.randomUUID !== 'function') {
    anyCrypto.randomUUID = uuidV4Fallback;
  }
}
