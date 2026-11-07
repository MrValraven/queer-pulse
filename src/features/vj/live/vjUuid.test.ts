import { afterEach, describe, expect, it, vi } from "vitest";
import { createVjUuid } from "./vjUuid";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("createVjUuid", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses randomUUID when the browser offers it", () => {
    expect(createVjUuid()).toMatch(UUID_V4_PATTERN);
  });

  it("falls back to getRandomValues when randomUUID is missing", () => {
    const realCrypto = globalThis.crypto;
    vi.stubGlobal("crypto", {
      getRandomValues: (array: Uint8Array<ArrayBuffer>) =>
        realCrypto.getRandomValues(array),
    });

    const firstUuid = createVjUuid();
    const secondUuid = createVjUuid();

    expect(firstUuid).toMatch(UUID_V4_PATTERN);
    expect(secondUuid).toMatch(UUID_V4_PATTERN);
    expect(secondUuid).not.toBe(firstUuid);
  });
});
