import { describe, expect, it } from "vitest";
import type { StudioPlaylistPersonDTO } from "./studio.types";
import {
  toArtistPlaysView,
  toTopSupportersView,
} from "./studioDashboardPlays.adapters";
import type {
  StudioArtistPlaysDTO,
  StudioArtistPlaysDayDTO,
} from "./studioDashboard.types";

function playsDto(
  days: StudioArtistPlaysDayDTO[],
  overrides: Partial<StudioArtistPlaysDTO> = {},
): StudioArtistPlaysDTO {
  return {
    days,
    total: { value: 120, isBelowThreshold: false },
    total28d: { value: 40, isBelowThreshold: false },
    ...overrides,
  };
}

const elevenAccountIdentities: {
  kind: "account";
  member: StudioPlaylistPersonDTO;
}[] = Array.from({ length: 11 }, (_entry, index) => ({
  kind: "account",
  member: {
    slug: `member-${index}`,
    displayName: `Member ${index}`,
    avatarUrl: null,
  },
}));

describe("toArtistPlaysView", () => {
  it("withholds a day of 1 to 4 and keeps a real zero", () => {
    const view = toArtistPlaysView(
      playsDto([
        { day: "2026-10-26", plays: { value: null, isBelowThreshold: true } },
        { day: "2026-10-27", plays: { value: 0, isBelowThreshold: false } },
      ]),
    );
    expect(view.days.map((day) => day.plays)).toEqual([
      { value: null, isBelowThreshold: true },
      { value: 0, isBelowThreshold: false },
    ]);
    expect(view.days.map((day) => day.isToday)).toEqual([false, true]);
    expect(view.days[0]?.day.toISOString()).toBe("2026-10-26T00:00:00.000Z");
  });
  it("fails closed on a small count the server forgot to flag, and drops an unreadable day", () => {
    const view = toArtistPlaysView(
      playsDto(
        [{ day: "soon", plays: { value: 9, isBelowThreshold: false } }],
        {
          total: { value: 3, isBelowThreshold: false },
        },
      ),
    );
    expect(view.days).toEqual([]);
    expect(view.total).toEqual({ value: null, isBelowThreshold: true });
  });
});

describe("toTopSupportersView", () => {
  it("keeps the server's ranking, at most ten, and floors the opted-in count", () => {
    const view = toTopSupportersView({
      items: elevenAccountIdentities.map((identity) => ({ identity })),
      optedInCount: { value: 2, isBelowThreshold: false },
    });
    expect(view.identities).toHaveLength(10);
    expect(view.identities[0]?.name).toBe(
      elevenAccountIdentities[0]!.member.displayName,
    );
    expect(view.optedInCount).toEqual({ value: null, isBelowThreshold: true });
  });
  it("shows a persona that is no longer listenable without a link", () => {
    const view = toTopSupportersView({
      items: [
        {
          identity: {
            kind: "persona",
            persona: {
              id: "sp-9",
              handle: "gone",
              name: "Gone",
              kind: "musician",
              avatarUrl: null,
              isLinkable: false,
            },
          },
        },
      ],
      optedInCount: { value: 7, isBelowThreshold: false },
    });
    expect(view.identities[0]?.href).toBeNull();
  });
});
