import { describe, expect, it } from "vitest";
import {
  removedCardDtoToSpace,
  safeSpaceDetailDtoToSpace,
  safeSpaceListToView,
  verifiedCardDtoToSpace,
} from "./safeSpaces.adapters";
import type {
  RemovedSpaceCardDTO,
  RemovedSpaceDetailDTO,
  SafeSpaceCardDTO,
  SafeSpaceDetailDTO,
  SafeSpaceListDTO,
} from "./safeSpaces.api";

const verifiedCard: SafeSpaceCardDTO = {
  status: "verified",
  slug: "purex",
  cat: "Bar",
  typeLabel: "Bar",
  name: "Purex",
  hood: "Intendente",
  desc: "One of Lisbon's longest-running queer bars.",
  tags: ["Gender-neutral bathrooms", "Accessible"],
  rating: "4.9",
  reviews: 54,
  tier: 1,
};

const removedCard: RemovedSpaceCardDTO = {
  status: "removed",
  slug: "bar-atlas",
  cat: "Bar",
  typeLabel: "Bar",
  name: "Bar Atlas",
  hood: "Santos",
  reason: "Door staff refused entry to a trans member.",
  removedDate: "8 May 2026",
  listedSince: "March 2024",
  flags: 5,
};

const verifiedDetail: SafeSpaceDetailDTO = {
  ...verifiedCard,
  eyebrow: "Bar · Intendente · Lisbon",
  sub: "A long-running queer bar.",
  verifier: "Mod team · 2 visits",
  reVerified: "2 May 2026",
  metaPills: [{ label: "Open late, Wed–Sun" }],
  promises: [{ title: "Staff intervene, every time.", desc: "..." }],
  vouches: [
    {
      initials: "KL",
      name: "Kai",
      tint: "jade",
      byline: "Member 2 years",
      text: "...",
      when: "Vouched 18 Apr 2026",
    },
  ],
  glance: [{ label: "Type", value: "Bar · Wed–Sun" }],
  address: "R. de São Lázaro 11 · Intendente",
};

const removedDetail: RemovedSpaceDetailDTO = {
  ...removedCard,
  reasonLong: ["In April 2026 a verified member was refused entry."],
  timeline: [{ date: "18 Apr 2026", event: "First incident reported." }],
  whatNow: "Bar Atlas is no longer a verified safe space.",
};

describe("verifiedCardDtoToSpace", () => {
  it("maps card fields and composes the reviews string", () => {
    const space = verifiedCardDtoToSpace(verifiedCard);
    expect(space.status).toBe("verified");
    expect(space.slug).toBe("purex");
    expect(space.category).toBe("Bar");
    expect(space.name).toBe("Purex");
    expect(space.neighbourhood).toBe("Intendente");
    expect(space.tags).toEqual(verifiedCard.tags);
    expect(space.rating).toBe("4.9");
    expect(space.reviews).toBe("54 reviews");
    expect(space.tier).toBe(1);
  });

  it("falls back tier to 0 when the DTO has none", () => {
    const space = verifiedCardDtoToSpace({ ...verifiedCard, tier: null });
    expect(space.tier).toBe(0);
  });

  it("fills detail-only fields with empty defaults, unread by the grid", () => {
    const space = verifiedCardDtoToSpace(verifiedCard);
    expect(space.promises).toEqual([]);
    expect(space.vouches).toEqual([]);
    expect(space.glance).toEqual([]);
    expect(space.metaPills).toEqual([]);
    expect(space.eyebrow).toBe("");
    expect(space.sub).toBe("");
    expect(space.address).toBe("");
  });
});

describe("removedCardDtoToSpace", () => {
  it("maps card fields the removed grid reads", () => {
    const space = removedCardDtoToSpace(removedCard);
    expect(space.status).toBe("removed");
    expect(space.slug).toBe("bar-atlas");
    expect(space.typeLabel).toBe("Bar");
    expect(space.neighbourhood).toBe("Santos");
    expect(space.name).toBe("Bar Atlas");
    expect(space.reason).toBe(removedCard.reason);
    expect(space.removedDate).toBe("8 May 2026");
    expect(space.flags).toBe(5);
  });

  it("fills detail-only fields with empty defaults", () => {
    const space = removedCardDtoToSpace(removedCard);
    expect(space.reasonLong).toEqual([]);
    expect(space.timeline).toEqual([]);
    expect(space.whatNow).toBe("");
  });
});

describe("safeSpaceListToView", () => {
  it("maps verified + removed cards and passes the stats through", () => {
    const dto: SafeSpaceListDTO = {
      verified: [verifiedCard],
      removed: [removedCard],
      stats: { verified: 1, reviews: 54, removed: 1 },
    };
    const view = safeSpaceListToView(dto);
    expect(view.verified).toHaveLength(1);
    expect(view.verified[0]?.slug).toBe("purex");
    expect(view.removed).toHaveLength(1);
    expect(view.removed[0]?.slug).toBe("bar-atlas");
    expect(view.stats).toEqual({ verified: 1, reviews: 54, removed: 1 });
  });
});

describe("safeSpaceDetailDtoToSpace", () => {
  it("maps a verified detail DTO to a verified AnySpace with the full detail body", () => {
    const result = safeSpaceDetailDtoToSpace(verifiedDetail);
    expect(result.kind).toBe("verified");
    if (result.kind !== "verified") throw new Error("expected verified");
    expect(result.data.slug).toBe("purex");
    expect(result.data.metaPills).toEqual(verifiedDetail.metaPills);
    expect(result.data.promises).toEqual(verifiedDetail.promises);
    expect(result.data.vouches).toEqual(verifiedDetail.vouches);
    expect(result.data.glance).toEqual(verifiedDetail.glance);
    expect(result.data.address).toBe(verifiedDetail.address);
    expect(result.data.reviews).toBe("54 reviews");
  });

  it("maps a removed detail DTO to a removed AnySpace with the full detail body", () => {
    const result = safeSpaceDetailDtoToSpace(removedDetail);
    expect(result.kind).toBe("removed");
    if (result.kind !== "removed") throw new Error("expected removed");
    expect(result.data.slug).toBe("bar-atlas");
    expect(result.data.reasonLong).toEqual(removedDetail.reasonLong);
    expect(result.data.timeline).toEqual(removedDetail.timeline);
    expect(result.data.whatNow).toBe(removedDetail.whatNow);
  });
});
