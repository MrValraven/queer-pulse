import { afterEach, describe, expect, it, vi } from "vitest";
import { createVjCommandStamper } from "./vjCommandStamp";

describe("createVjCommandStamper", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stamps commands with one client id and a rising sequence", () => {
    const newId = vi.fn(() => "client-1");
    const stamper = createVjCommandStamper(newId);

    const firstStamp = stamper.next();
    const secondStamp = stamper.next();

    expect(firstStamp).toEqual({ clientId: "client-1", commandSequence: 1 });
    expect(secondStamp).toEqual({ clientId: "client-1", commandSequence: 2 });
    expect(stamper.clientId).toBe("client-1");
    expect(newId).toHaveBeenCalledTimes(1);
  });

  it("mints a uuid client id by default and keeps separate stampers apart", () => {
    const firstStamper = createVjCommandStamper();
    const secondStamper = createVjCommandStamper();

    expect(firstStamper.clientId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(secondStamper.clientId).not.toBe(firstStamper.clientId);
    firstStamper.next();
    expect(secondStamper.next().commandSequence).toBe(1);
  });

  it("mints a client id over plain http where randomUUID is missing", () => {
    const realCrypto = globalThis.crypto;
    vi.stubGlobal("crypto", {
      getRandomValues: (array: Uint8Array<ArrayBuffer>) =>
        realCrypto.getRandomValues(array),
    });

    const stamper = createVjCommandStamper();

    expect(stamper.clientId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
