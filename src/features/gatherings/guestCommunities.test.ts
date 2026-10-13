import { describe, expect, it } from "vitest";
import type { GuestCommunityDraftEntry } from "./api/eventCommunities.api";
import {
  countActiveGuests,
  diffGuestCommunities,
  guestsForLead,
  hasGuestCommunityChanges,
} from "./guestCommunities";

function entry(
  slug: string,
  status: GuestCommunityDraftEntry["status"],
): GuestCommunityDraftEntry {
  return { slug, name: slug, accessTier: "public", status };
}

describe("countActiveGuests", () => {
  it("counts pending and joined rows and leaves declined ones out", () => {
    expect(
      countActiveGuests([
        entry("a", "pending"),
        entry("b", "accepted"),
        entry("c", "declined"),
        entry("d", "unsent"),
      ]),
    ).toBe(3);
  });
});

describe("guestsForLead", () => {
  it("drops the guest that became the lead", () => {
    expect(
      guestsForLead([entry("a", "accepted"), entry("b", "pending")], "a"),
    ).toEqual([entry("b", "pending")]);
  });

  it("drops rows that never went out when the lead is cleared, and keeps saved ones", () => {
    expect(
      guestsForLead([entry("a", "accepted"), entry("b", "unsent")], ""),
    ).toEqual([entry("a", "accepted")]);
  });
});

describe("diffGuestCommunities", () => {
  const saved = [entry("joined", "accepted"), entry("waiting", "pending")];

  it("invites added rows and removes dropped saved rows", () => {
    const changes = diffGuestCommunities(
      saved,
      [entry("joined", "accepted"), entry("new", "unsent")],
      "lead",
    );
    expect(changes).toEqual({
      invites: [entry("new", "unsent")],
      removeSlugs: ["waiting"],
    });
    expect(hasGuestCommunityChanges(changes)).toBe(true);
  });

  it("sends nothing for an unchanged list", () => {
    const changes = diffGuestCommunities(saved, saved, "lead");
    expect(changes).toEqual({ invites: [], removeSlugs: [] });
    expect(hasGuestCommunityChanges(changes)).toBe(false);
  });

  it("sends no removal for a saved guest the save made the lead", () => {
    expect(
      diffGuestCommunities(saved, [entry("waiting", "pending")], "joined"),
    ).toEqual({ invites: [], removeSlugs: [] });
  });

  it("queues no removal for a declined row", () => {
    expect(
      diffGuestCommunities([entry("no", "declined")], [], "lead").removeSlugs,
    ).toEqual([]);
  });

  it("invites nobody while the gathering has no lead", () => {
    expect(
      diffGuestCommunities([], [entry("new", "unsent")], "").invites,
    ).toEqual([]);
  });
});
