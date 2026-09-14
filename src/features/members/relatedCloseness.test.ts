import { describe, expect, it } from "vitest";
import {
  closenessBetween,
  pickCloseness,
  sharedCraft,
  sharedOpenTo,
  type ClosenessSignals,
} from "./relatedCloseness";
import type { Member } from "./data/members";

const NONE: ClosenessSignals = {
  vouchedForOwner: false,
  ownerVouchedFor: false,
  sharedCommunity: null,
  sharedOpenTo: null,
  sharedCraft: null,
  sharedHood: null,
};

/** A mock-registry member with only the fields `closenessBetween` reads. */
const member = (overrides: Partial<Member> = {}): Member =>
  ({
    slug: "them",
    first: "Rui",
    last: "Marçal",
    visibility: "open",
    hood: "Marvila",
    tags: [],
    openTo: [],
    groups: [],
    vouchers: [],
    ...overrides,
  }) as Member;

describe("pickCloseness", () => {
  it("returns null when every signal is absent", () => {
    expect(pickCloseness(NONE)).toBeNull();
  });

  it("ranks strongest first, all the way down the list", () => {
    const all: ClosenessSignals = {
      vouchedForOwner: true,
      ownerVouchedFor: true,
      sharedCommunity: "Editorial Reading Circle",
      sharedOpenTo: { kind: "preset", id: "casualMeetups" },
      sharedCraft: "Ceramics",
      sharedHood: "Marvila",
    };
    expect(pickCloseness(all)).toEqual({
      kind: "vouchedForOwner",
      value: null,
    });
    expect(pickCloseness({ ...all, vouchedForOwner: false })).toEqual({
      kind: "ownerVouchedFor",
      value: null,
    });
    expect(
      pickCloseness({ ...all, vouchedForOwner: false, ownerVouchedFor: false }),
    ).toEqual({ kind: "community", value: "Editorial Reading Circle" });
    expect(
      pickCloseness({
        ...NONE,
        sharedOpenTo: { kind: "preset", id: "casualMeetups" },
        sharedCraft: "Ceramics",
        sharedHood: "Marvila",
      }),
    ).toEqual({ kind: "openToPreset", value: "casualMeetups" });
    expect(
      pickCloseness({
        ...NONE,
        sharedCraft: "Ceramics",
        sharedHood: "Marvila",
      }),
    ).toEqual({ kind: "craft", value: "Ceramics" });
    expect(pickCloseness({ ...NONE, sharedHood: "Marvila" })).toEqual({
      kind: "hood",
      value: "Marvila",
    });
  });

  it("sends a custom open-to chip under its own kind", () => {
    expect(
      pickCloseness({
        ...NONE,
        sharedOpenTo: { kind: "custom", label: "Kiln share" },
      }),
    ).toEqual({ kind: "openToCustom", value: "Kiln share" });
  });
});

describe("sharedOpenTo", () => {
  it("keeps the owner's chip order and matches customs case-insensitively", () => {
    expect(
      sharedOpenTo(
        [
          { kind: "preset", id: "mentoring" },
          { kind: "custom", label: "Kiln share" },
        ],
        [
          { kind: "custom", label: " kiln SHARE " },
          { kind: "preset", id: "mentoring" },
        ],
      ),
    ).toEqual({ kind: "preset", id: "mentoring" });
  });

  it("never matches a preset id against a custom label of the same text", () => {
    expect(
      sharedOpenTo(
        [{ kind: "preset", id: "casualMeetups" }],
        [{ kind: "custom", label: "casualMeetups" }],
      ),
    ).toBeNull();
  });
});

describe("sharedCraft", () => {
  it("returns the owner's spelling of the first shared tag", () => {
    expect(sharedCraft(["Ceramics", "Glaze"], ["glaze", "ceramics"])).toBe(
      "Ceramics",
    );
  });
});

describe("closenessBetween (demo mode)", () => {
  const owner = member({
    slug: "ines",
    first: "Inês",
    vouchers: ["them"],
    groups: [{ name: "Editorial Reading Circle", role: "Member" }],
    tags: ["Ceramics"],
    openTo: [{ kind: "preset", id: "casualMeetups" }],
  });

  it("reads the owner's voucher list as the incoming direction", () => {
    expect(closenessBetween(owner, member())).toEqual({
      kind: "vouchedForOwner",
      value: null,
    });
  });

  it("honours the owner's hidden voucher roster", () => {
    expect(
      closenessBetween({ ...owner, vouchersVisible: false }, member()),
    ).toBeNull();
  });

  it("names a shared group as the community chip", () => {
    expect(
      closenessBetween(
        { ...owner, vouchers: [] },
        member({
          groups: [{ name: "Editorial Reading Circle", role: "Member" }],
        }),
      ),
    ).toEqual({ kind: "community", value: "Editorial Reading Circle" });
  });

  it("drops their open-to chip when their profile is not open", () => {
    expect(
      closenessBetween(
        { ...owner, vouchers: [] },
        member({
          visibility: "network",
          openTo: [{ kind: "preset", id: "casualMeetups" }],
          tags: ["Ceramics"],
        }),
      ),
    ).toEqual({ kind: "craft", value: "Ceramics" });
  });

  it("drops the hood when either side hid it", () => {
    const craftless = { ...owner, vouchers: [], tags: [], openTo: [] };
    expect(
      closenessBetween(craftless, member({ hoodVisible: false })),
    ).toBeNull();
    expect(closenessBetween(craftless, member())).toEqual({
      kind: "hood",
      value: "Marvila",
    });
  });
});
