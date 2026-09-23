import { describe, expect, it } from "vitest";
import { MessageTombstones } from "./messageTombstones";

describe("MessageTombstones", () => {
  it("remembers a deleted message id", () => {
    const tombstones = new MessageTombstones(3);
    tombstones.record("m1");
    expect(tombstones.has("m1")).toBe(true);
    expect(tombstones.has("m2")).toBe(false);
  });

  it("forgets the oldest id past its capacity", () => {
    const tombstones = new MessageTombstones(2);
    tombstones.record("m1");
    tombstones.record("m2");
    tombstones.record("m3");
    expect(tombstones.has("m1")).toBe(false);
    expect(tombstones.has("m3")).toBe(true);
  });
});
