import { describe, expect, it, vi } from "vitest";
import { createVjCommandStamper } from "./vjCommandStamp";

describe("createVjCommandStamper", () => {
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
});
