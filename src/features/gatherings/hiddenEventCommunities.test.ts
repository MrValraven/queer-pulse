import { describe, expect, it } from "vitest";
import { hiddenCommunityToastMessage } from "./api/hiddenCommunityErrors";
import {
  placeholderRowFor,
  withSavedRow,
} from "./api/hiddenEventCommunities.api";
import { filterDemoEvents } from "./api/useEvents";
import type { CalendarEvent } from "./data";
import {
  isDemoSlugHidden,
  isDroppedOptimistically,
  isHiddenByCommunities,
} from "./hiddenEventCommunities";
import { demoCommunityId } from "./hiddenEventCommunities.data";

/**
 * The hiding rule matches the server's SQL: an event leaves the member's
 * upcoming lists only when its lead AND every accepted guest are hidden, so
 * one host the member still wants to see keeps it on the board.
 */

const LEAD = "community-lead";
const GUEST = "community-guest";

describe("isHiddenByCommunities", () => {
  it("hides an event whose hidden lead has no guests", () => {
    expect(isHiddenByCommunities(LEAD, [], new Set([LEAD]))).toBe(true);
  });

  it("keeps an event whose hidden lead has one guest still shown", () => {
    expect(isHiddenByCommunities(LEAD, [GUEST], new Set([LEAD]))).toBe(false);
  });

  it("hides an event whose lead and every guest are hidden", () => {
    expect(isHiddenByCommunities(LEAD, [GUEST], new Set([LEAD, GUEST]))).toBe(
      true,
    );
  });

  it("keeps an event with no lead and no guests", () => {
    expect(isHiddenByCommunities(undefined, [], new Set([LEAD]))).toBe(false);
  });

  it("hides an event with no lead whose guests are all hidden", () => {
    expect(isHiddenByCommunities(undefined, [GUEST], new Set([GUEST]))).toBe(
      true,
    );
  });

  it("keeps an event whose lead is shown while a guest is hidden", () => {
    expect(isHiddenByCommunities(LEAD, [GUEST], new Set([GUEST]))).toBe(false);
  });

  it("keeps every event when the member hides nothing", () => {
    expect(isHiddenByCommunities(LEAD, [], new Set())).toBe(false);
  });
});

/** 18:00 on 20 October 2026, the clock every demo case below reads. */
const NOW = new Date(2026, 9, 20, 18, 0);

function gathering(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    date: new Date(2026, 9, 24, 20, 0),
    org: "Community",
    orgColor: "var(--violet)",
    title: "A gathering",
    hood: "Anjos",
    to: "/gatherings/a-gathering",
    kind: "gathering",
    ...overrides,
  };
}

const barreiro = {
  id: demoCommunityId("queer-barreiro"),
  slug: "queer-barreiro",
  name: "Queer Barreiro",
};

const hiddenBarreiroRow = gathering({
  slug: "queer-karaoke-night",
  title: "Karaoke night",
  hostingCommunity: barreiro,
});
const unhostedRow = gathering({ slug: "open-call", title: "Open call" });
const pastBarreiroRow = gathering({
  slug: "queer-history-walk-june",
  date: new Date(2026, 5, 14, 11, 0),
  hostingCommunity: barreiro,
});
const hiddenIds = new Set([barreiro.id]);
const rows = [hiddenBarreiroRow, unhostedRow, pastBarreiroRow];

describe("filterDemoEvents and hidden communities", () => {
  it("drops a hidden community's events from the upcoming list", () => {
    const shown = filterDemoEvents(rows, "upcoming", undefined, NOW, hiddenIds);
    expect(shown).toEqual([unhostedRow]);
  });

  it("keeps them on the upcoming list when hidden events are asked for", () => {
    const shown = filterDemoEvents(
      rows,
      "upcoming",
      undefined,
      NOW,
      hiddenIds,
      true,
    );
    expect(shown).toEqual([hiddenBarreiroRow, unhostedRow]);
  });

  it("keeps them on the past list", () => {
    const shown = filterDemoEvents(rows, "past", undefined, NOW, hiddenIds);
    expect(shown).toEqual([pastBarreiroRow]);
  });

  it("keeps them on a My events list", () => {
    const shown = filterDemoEvents(rows, "going", undefined, NOW, hiddenIds);
    expect(shown).toEqual(rows);
  });

  it("drops a hidden community's match from a browse search", () => {
    const shownFilmNight = gathering({
      slug: "film-night",
      title: "Film night",
    });
    const shown = filterDemoEvents(
      [...rows, shownFilmNight],
      "upcoming",
      { q: "night" },
      NOW,
      hiddenIds,
    );
    expect(shown).toEqual([shownFilmNight]);
  });
});

describe("co-hosted events", () => {
  const runnersId = demoCommunityId("queer-runners");
  const artsId = demoCommunityId("rainbow-arts");
  const coHosted = gathering({ hostingCommunity: { ...barreiro, id: artsId } });

  it("keeps a demo registry event while its guest is still shown", () => {
    expect(isDemoSlugHidden("portfolio-night", new Set([artsId]))).toBe(false);
    const both = new Set([artsId, runnersId]);
    expect(isDemoSlugHidden("portfolio-night", both)).toBe(true);
  });

  it("drops a live row the community leads alone", () => {
    expect(isDroppedOptimistically(coHosted, artsId)).toBe(true);
    expect(isDroppedOptimistically(coHosted, runnersId)).toBe(false);
  });

  it("leaves a live co-hosted row for the server to decide", () => {
    const row = { ...coHosted, isCoHosted: true };
    expect(isDroppedOptimistically(row, artsId)).toBe(false);
  });

  it("runs the full rule on demo rows", () => {
    const row = { ...coHosted, slug: "portfolio-night" };
    expect(isDroppedOptimistically(row, artsId, new Set([artsId]))).toBe(false);
  });

  it("names the event that stays in the hide toast", () => {
    const translate = (key: string) => key;
    expect(
      hiddenCommunityToastMessage("Arts", "Portfolio night", translate),
    ).toBe("gatherings:hiddenCommunities.toast.hiddenEventStays");
    expect(hiddenCommunityToastMessage("Arts", undefined, translate)).toBe(
      "gatherings:hiddenCommunities.toast.hidden",
    );
  });
});

describe("withSavedRow", () => {
  it("swaps the placeholder for the saved row and keeps the rest", () => {
    const older = placeholderRowFor({ slug: "older", name: "Older" }, "id-1");
    const pending = placeholderRowFor(
      { slug: "arts", name: "Arts" },
      undefined,
    );
    const saved = { ...pending, communityId: "id-2" };
    expect(withSavedRow([pending, older], saved)).toEqual([saved, older]);
  });
});
