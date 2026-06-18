import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { randomUUID } from 'crypto';

setupZoneTestEnv();

// jsdom não expõe crypto.randomUUID — polyfill com o crypto do Node
const globalCrypto = (globalThis as unknown as { crypto?: { randomUUID?: () => string } });
if (!globalCrypto.crypto) {
  (globalThis as unknown as { crypto: unknown }).crypto = {};
}
if (typeof globalCrypto.crypto!.randomUUID !== 'function') {
  Object.defineProperty(globalCrypto.crypto, 'randomUUID', { value: randomUUID, configurable: true });
}
