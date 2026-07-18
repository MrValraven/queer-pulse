import { describe, expect, it } from "vitest";
import { MEMBERS as CARDS } from "./memberDirectoryFilter.data";
import { MEMBERS as REGISTRY } from "./data/members";
import { openToPresetIds } from "./openTo.data";

describe("member directory cards", () => {
  it("mirrors each member's real openTo presets", () => {
    for (const card of CARDS) {
      const member = REGISTRY[card.slug];
      if (!member) continue;
      expect(card.openTo).toEqual(openToPresetIds(member.openTo));
    }
  });

  it("uses each member's real neighbourhood", () => {
    for (const card of CARDS) {
      const member = REGISTRY[card.slug];
      if (!member) continue;
      expect(card.hood).toBe(member.hood);
    }
  });

  it("uses each member's real vouch count", () => {
    for (const card of CARDS) {
      const member = REGISTRY[card.slug];
      if (!member) continue;
      expect(card.vouchCount).toBe(member.vouchers.length);
    }
  });

  it("leaves openTo empty for a member with none, rather than inventing it", () => {
    const withoutOpenTo = CARDS.filter((card) => {
      const member = REGISTRY[card.slug];
      return member && member.openTo.length === 0;
    });
    for (const card of withoutOpenTo) expect(card.openTo).toEqual([]);
  });
});
