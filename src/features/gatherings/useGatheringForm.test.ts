import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { emptyAccessibilityAnswers } from "../marketing/listBusiness/listingAccessibility.data";
import { LANGS, MAX_GATHERING_SPAN_DAYS } from "./createGathering.data";
import type { RsvpCutoff } from "./gatheringExtras";
import {
  useGatheringForm,
  type CohostPick,
  type GatheringFormSeed,
} from "./useGatheringForm";

/** A co-host pick as the picker builds it. */
const ARI_PICK: CohostPick = {
  slug: "ari",
  name: "Ari Sousa",
  initials: "AS",
  avatarUrl: null,
};

/**
 * The wizard's schedule state, now that a gathering may span more than one day.
 *
 * Two things are being pinned here. The first is the auto-adjust contract: the
 * end date fills itself in, follows the start date when that moves, and rolls
 * past midnight when the clock says the night wraps, and only the host makes
 * it shorter. A host who typed "Friday to Sunday" and then nudged the start time
 * by fifteen minutes must still have a three-day festival afterwards.
 *
 * The second is `scheduleValid`, which mirrors the backend's
 * `assertScheduleValid`. Every case it rejects is a 400 the host would
 * otherwise meet on the last step of the wizard with nothing to act on.
 *
 * Dates are built relative to today because `dateValid` requires a start that
 * is still in the future, and a hardcoded 2026 date would start failing on its
 * own one day. The one exception is the span-cap case, which needs a fixed
 * window to keep a minute-wide boundary exact; it says so where it stands.
 */

/** A local calendar day as the `"YYYY-MM-DD"` string the hook stores. Local,
 *  because the hook reads these strings as local calendar days. */
function formatLocalDay(day: Date): string {
  const year = String(day.getFullYear()).padStart(4, "0");
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(day.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}

/** A local `"YYYY-MM-DD"` a whole number of days from today. */
function futureDate(daysFromToday: number): string {
  const day = new Date();
  day.setHours(12, 0, 0, 0);
  day.setDate(day.getDate() + daysFromToday);
  return formatLocalDay(day);
}

/** A local `"YYYY-MM-DD"` a whole number of days from another one. */
function shiftDate(value: string, days: number): string {
  const parts = value.split("-").map(Number);
  return formatLocalDay(new Date(parts[0]!, parts[1]! - 1, parts[2]! + days));
}

describe("useGatheringForm end date", () => {
  it("fills the end date with the start date for an evening that ends the same night", () => {
    const { result } = renderHook(() => useGatheringForm());

    // The wizard's own defaults: 19:00 to 22:00.
    expect(result.current.time).toBe("19:00");
    expect(result.current.endTime).toBe("22:00");

    act(() => result.current.setDate(futureDate(10)));

    expect(result.current.endDate).toBe(futureDate(10));
    expect(result.current.spanDays).toBe(0);
    expect(result.current.scheduleValid).toBe(true);
  });

  it("rolls the end date to the next day for a 23:00 to 04:00 night", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setTime("23:00"));
    act(() => result.current.setEndTime("04:00"));

    expect(result.current.endDate).toBe(futureDate(11));
    expect(result.current.spanDays).toBe(1);
    expect(result.current.scheduleValid).toBe(true);
  });

  it("rolls the end date forward on an end-time edit alone", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    // The start time is left at its 19:00 default, so the roll-over is the end
    // time's own doing. The 23:00-start case above rolls during `setTime`,
    // which leaves this path untested otherwise.
    act(() => result.current.setEndTime("02:00"));

    expect(result.current.endDate).toBe(futureDate(11));
    expect(result.current.scheduleValid).toBe(true);
  });

  it("moves an already-set end date by the same number of days as the start", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    // A Friday-to-Sunday festival: two whole days of span.
    act(() => result.current.setEndDate(futureDate(12)));
    expect(result.current.spanDays).toBe(2);

    act(() => result.current.setDate(futureDate(13)));

    expect(result.current.endDate).toBe(futureDate(15));
    expect(result.current.spanDays).toBe(2);
  });

  it("leaves a hand-picked end date alone when the start time still ends before it", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setEndDate(futureDate(12)));

    act(() => result.current.setTime("21:00"));

    expect(result.current.endDate).toBe(futureDate(12));
    expect(result.current.scheduleValid).toBe(true);
  });

  it("keeps a longer end date where the host put it when the end time moves", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setEndDate(futureDate(12)));

    // An end time earlier in the clock than the start time would roll a
    // single-day gathering forward. It must not pull a three-day one back.
    act(() => result.current.setEndTime("04:00"));

    expect(result.current.endDate).toBe(futureDate(12));
  });
});

describe("useGatheringForm scheduleValid", () => {
  it("rejects an end instant exactly equal to the start instant", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setEndTime("19:00"));
    // The end time alone rolled the date forward, which is a valid schedule.
    expect(result.current.scheduleValid).toBe(true);

    // Pulling the end date back onto the start day makes the two instants
    // identical, which the backend rejects.
    act(() => result.current.setEndDate(futureDate(10)));

    expect(result.current.scheduleValid).toBe(false);
  });

  it("rejects an end instant before the start instant", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setEndDate(futureDate(9)));

    expect(result.current.scheduleValid).toBe(false);
  });

  it("caps the span on elapsed time exactly the way the backend does", () => {
    // The boundary is a minute wide, so it is pinned on fixed dates in June
    // rather than on `futureDate`: no zone changes its offset in June, and a
    // daylight-saving change inside the span would move the last valid minute
    // by an hour. `scheduleValid` reads only the four fields (the clock is
    // `dateValid`'s job), so a date in the past is a perfectly good input here.
    const startDate = "2026-06-12";
    const endDate = shiftDate(startDate, MAX_GATHERING_SPAN_DAYS);
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(startDate));
    act(() => result.current.setEndDate(endDate));

    // Fourteen days on the calendar AND fourteen days on the clock: 19:00 to
    // 19:00, which is exactly the cap.
    act(() => result.current.setEndTime("19:00"));
    expect(result.current.spanDays).toBe(MAX_GATHERING_SPAN_DAYS);
    expect(result.current.scheduleValid).toBe(true);

    // Still fourteen calendar days, and one minute too long. Counting days
    // would wave this through and leave the host with an unexplained 400.
    act(() => result.current.setEndTime("19:01"));
    expect(result.current.spanDays).toBe(MAX_GATHERING_SPAN_DAYS);
    expect(result.current.scheduleValid).toBe(false);
  });

  it("rejects a fifteenth calendar day", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(2)));
    act(() =>
      result.current.setEndDate(futureDate(2 + MAX_GATHERING_SPAN_DAYS + 1)),
    );

    expect(result.current.spanDays).toBe(MAX_GATHERING_SPAN_DAYS + 1);
    expect(result.current.scheduleValid).toBe(false);
  });

  it("accepts a gathering with no end time at all", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setEndTime(""));

    expect(result.current.scheduleValid).toBe(true);
  });
});

/**
 * The family and format half of the wizard.
 *
 * What is pinned here is the promise the type step makes: picking a format
 * sets sensible defaults and asks one or two questions specific to it. That
 * promise only holds if the defaults know when to stop. A host who typed a
 * capacity, or who turned the headcount off, has said something, and no
 * later format change may quietly overrule them. The other half is that an
 * answer lives only as long as its question: a "what to bring" from a potluck
 * stays behind when the host moves to a screening, where nothing on screen
 * would show it again.
 */
describe("useGatheringForm family and format", () => {
  it("applies the family's capacity default while the field is untouched", () => {
    const { result } = renderHook(() => useGatheringForm());
    expect(result.current.cap).toBe("14");

    act(() => result.current.selectFormat("care", "support-circle"));
    expect(result.current.cap).toBe("10");

    act(() => result.current.selectFormat("party", "club-night"));
    expect(result.current.cap).toBe("40");
  });

  it("keeps the capacity the host typed through a format change", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setCapTouched("6"));
    act(() => result.current.selectFormat("party", "club-night"));

    expect(result.current.cap).toBe("6");
    expect(result.current.capacityDefault).toBeNull();
  });

  it("hides the attendee count for care, and shows it everywhere else", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.selectFormat("care", "peer-group"));
    expect(result.current.showAttendeeCount).toBe(false);

    act(() => result.current.selectFormat("eat", "potluck"));
    expect(result.current.showAttendeeCount).toBe(true);
  });

  it("leaves the attendee count alone once the host has set it", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setShowAttendeeCount(false));
    act(() => result.current.selectFormat("party", "house-party"));

    expect(result.current.showAttendeeCount).toBe(false);
  });

  it("drops detail answers the new family does not ask for", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.selectFormat("eat", "potluck"));
    act(() => result.current.setFormatDetail("bring", "a dish"));
    expect(result.current.submittedFormatDetails).toEqual({ bring: "a dish" });

    act(() => result.current.selectFormat("watch", "screening"));
    expect(result.current.formatDetails).toEqual({});
    expect(result.current.submittedFormatDetails).toBeNull();
  });

  it("clears a detail answer the host emptied rather than storing a hole", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.selectFormat("eat", "potluck"));
    act(() => result.current.setFormatDetail("bring", "a dish"));
    act(() => result.current.setFormatDetail("bring", ""));

    expect(result.current.submittedFormatDetails).toBeNull();
  });

  it("counts a curated format as chosen, and an unnamed own format as not", () => {
    const { result } = renderHook(() => useGatheringForm());
    expect(result.current.isFormatChosen).toBe(false);

    act(() => result.current.selectFormat("make", "zine-making"));
    expect(result.current.isFormatChosen).toBe(true);

    act(() => result.current.selectFormat("make", "other"));
    expect(result.current.isFormatChosen).toBe(false);

    act(() => result.current.setOtherText("Risograph afternoon"));
    expect(result.current.isFormatChosen).toBe(true);
  });

  it("clears the format when the host switches family in the family row", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.selectFormat("move", "swim"));
    act(() => result.current.selectFamily("learn"));

    expect(result.current.family).toBe("learn");
    expect(result.current.format).toBe("");
    expect(result.current.isFormatChosen).toBe(false);
  });
});

/**
 * The care and access fields Create Gathering v2 adds.
 *
 * Two coupling rules are pinned here, both borrowed from the capacity field.
 * The RSVP cutoff follows the family only until the host picks one. And a
 * theme the family's own details already ask about (ruling R6) is hidden and
 * dropped the moment that family is picked, so the host is asked once.
 */
describe("useGatheringForm care and access", () => {
  it("adds and removes themes, and ignores a fourth", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.toggleTheme("sapphic"));
    act(() => result.current.toggleTheme("trans-led"));
    act(() => result.current.toggleTheme("portuguese-practice"));
    act(() => result.current.toggleTheme("family-friendly"));
    expect(result.current.themes).toEqual([
      "sapphic",
      "trans-led",
      "portuguese-practice",
    ]);

    act(() => result.current.toggleTheme("trans-led"));
    expect(result.current.themes).toEqual(["sapphic", "portuguese-practice"]);
  });

  it("hides and drops the themes a family's details already ask (R6)", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.toggleTheme("sober"));
    act(() => result.current.toggleTheme("adults-only"));
    act(() => result.current.toggleTheme("sapphic"));
    expect(result.current.hiddenThemeKeys).toEqual([]);

    act(() => result.current.selectFormat("party", "club-night"));
    expect(result.current.hiddenThemeKeys).toEqual(["adults-only", "sober"]);
    expect(result.current.themes).toEqual(["sapphic"]);

    act(() => result.current.selectFormat("move", "swim"));
    expect(result.current.hiddenThemeKeys).toEqual(["beginners-welcome"]);
  });

  it("follows the family's RSVP cutoff while the host has not picked one", () => {
    const { result } = renderHook(() => useGatheringForm());
    expect(result.current.rsvpCutoff).toBe("one-hour-before");

    act(() => result.current.selectFormat("eat", "potluck"));
    expect(result.current.rsvpCutoff).toBe("day-before");

    act(() => result.current.selectFormat("party", "club-night"));
    expect(result.current.rsvpCutoff).toBe("one-hour-before");
  });

  it("keeps the RSVP cutoff the host picked", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setRsvpCutoff("three-days-before"));
    act(() => result.current.selectFormat("eat", "potluck"));

    expect(result.current.rsvpCutoff).toBe("three-days-before");
  });

  it("keeps When it ends through a family change, and counts it as dirty", () => {
    const { result } = renderHook(() => useGatheringForm());
    expect(result.current.dirty).toBe(false);

    act(() => result.current.setRsvpCutoff(null));
    // Dirty from the cutoff alone, before any format pick could make it so.
    expect(result.current.dirty).toBe(true);

    act(() => result.current.selectFormat("eat", "potluck"));

    expect(result.current.rsvpCutoff).toBeNull();
    expect(result.current.isRsvpCutoffTouched).toBe(true);
    expect(result.current.dirty).toBe(true);
  });

  it("caps house rules and the custom RSVP question at their column widths", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setHouseRules("a".repeat(200)));
    act(() => result.current.setCustomRsvpQuestion("b".repeat(200)));

    expect(result.current.houseRules).toHaveLength(160);
    expect(result.current.customRsvpQuestion).toHaveLength(120);
  });

  it("starts free, with the waitlist on and every RSVP question off", () => {
    const { result } = renderHook(() => useGatheringForm());

    expect(result.current.costKind).toBe("free");
    expect(result.current.allowWaitlist).toBe(true);
    expect(result.current.rsvpQuestions).toEqual({
      dietary: false,
      pronouns: false,
      access: false,
    });
    expect(result.current.coverImageUrl).toBe("");
    expect(result.current.coverPreviewUrl).toBe("");
    expect(result.current.cohosts).toEqual([]);
    expect(result.current.cohostSlugs).toEqual([]);
    expect(result.current.dirty).toBe(false);
  });

  it("toggles RSVP questions, content notes and co-hosts, and counts them as dirty", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.toggleRsvpQuestion("pronouns"));
    expect(result.current.rsvpQuestions.pronouns).toBe(true);
    expect(result.current.dirty).toBe(true);

    act(() => result.current.toggleRsvpQuestion("pronouns"));
    act(() => result.current.toggleContentNote("loud-sound"));
    expect(result.current.contentNotes).toEqual(["loud-sound"]);

    act(() => result.current.toggleContentNote("loud-sound"));
    act(() => result.current.toggleCohost(ARI_PICK));
    expect(result.current.cohosts).toEqual([ARI_PICK]);
    expect(result.current.cohostSlugs).toEqual(["ari"]);
    expect(result.current.dirty).toBe(true);

    // Matched on the slug, so a copy with other display data removes it.
    act(() => result.current.toggleCohost({ ...ARI_PICK, name: "Ari" }));
    expect(result.current.cohosts).toEqual([]);
    expect(result.current.cohostSlugs).toEqual([]);
    expect(result.current.dirty).toBe(false);
  });

  it("hands back the same co-host slug array while the picks are unchanged", () => {
    const { result, rerender } = renderHook(() => useGatheringForm());

    act(() => result.current.toggleCohost(ARI_PICK));
    const slugsBeforeRerender = result.current.cohostSlugs;
    rerender();

    expect(result.current.cohostSlugs).toBe(slugsBeforeRerender);
  });
});

/** A complete seed as `gatheringToFormSeed` would build it. */
function lastGatheringSeed(): GatheringFormSeed {
  return {
    family: "eat",
    format: "supper-club",
    otherText: "",
    formatDetails: null,
    showAttendeeCount: true,
    title: "Last month's supper",
    description: "A long table.",
    hood: "Mouraria",
    venue: "Casa Independente",
    venueListingId: null,
    venueListing: null,
    address: "Largo do Intendente 45",
    directions: "Ring twice",
    onlineUrl: "",
    capacity: "18",
    language: "Portuguese only",
    cost: "10 EUR",
    accessibilityAnswers: emptyAccessibilityAnswers(),
    accessNotes: "One step at the door",
    audienceScope: "members",
    communitySlug: "",
    themes: ["sapphic"],
    contentNotes: ["loud-sound"],
    houseRules: "No photos without asking",
    costKind: "fixed",
    rsvpCutoff: "three-days-before",
    rsvpQuestions: { dietary: true, pronouns: true, access: false },
    customRsvpQuestion: "Anything you cannot eat?",
    allowWaitlist: false,
    startTime: "20:30",
    endTime: "23:45",
  };
}

describe("useGatheringForm applyLastGatheringSeed", () => {
  it("copies the logistics and leaves title, date, format and pledges alone", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.applyLastGatheringSeed(lastGatheringSeed()));

    expect(result.current.venue).toBe("Casa Independente");
    expect(result.current.hood).toBe("Mouraria");
    expect(result.current.address).toBe("Largo do Intendente 45");
    expect(result.current.directions).toBe("Ring twice");
    expect(result.current.time).toBe("20:30");
    expect(result.current.endTime).toBe("23:45");
    expect(result.current.endDate).toBe(futureDate(10));
    expect(result.current.cap).toBe("18");
    expect(result.current.isCapTouched).toBe(true);
    expect(result.current.lang).toBe("Portuguese only");
    expect(result.current.cost).toBe("10 EUR");
    expect(result.current.costKind).toBe("fixed");
    expect(result.current.houseRules).toBe("No photos without asking");
    expect(result.current.rsvpQuestions).toEqual({
      dietary: true,
      pronouns: true,
      access: false,
    });
    expect(result.current.customRsvpQuestion).toBe("Anything you cannot eat?");
    expect(result.current.accessNotes).toBe("One step at the door");

    expect(result.current.title).toBe("");
    expect(result.current.date).toBe(futureDate(10));
    expect(result.current.family).toBe("");
    expect(result.current.format).toBe("");
    expect(result.current.checks).toEqual([false, false]);
    // Not in the "same as last time" set: these describe the gathering
    // itself, which the host is choosing afresh.
    expect(result.current.themes).toEqual([]);
    expect(result.current.contentNotes).toEqual([]);
    expect(result.current.rsvpCutoff).toBe("one-hour-before");
    expect(result.current.allowWaitlist).toBe(true);
  });

  it("keeps the capacity it copied through a later format pick", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.applyLastGatheringSeed(lastGatheringSeed()));
    act(() => result.current.selectFormat("party", "club-night"));

    expect(result.current.cap).toBe("18");
  });
});

describe("useGatheringForm duplicate seed RSVP cutoff", () => {
  it("copies a null cutoff as When it ends, and keeps it through a family change", () => {
    const seed: GatheringFormSeed = {
      ...lastGatheringSeed(),
      rsvpCutoff: null,
    };
    const { result } = renderHook(() => useGatheringForm({ seed }));

    expect(result.current.rsvpCutoff).toBeNull();
    expect(result.current.isRsvpCutoffTouched).toBe(true);

    act(() => result.current.selectFormat("party", "club-night"));
    expect(result.current.rsvpCutoff).toBeNull();
  });

  it("leaves the family default in charge when the seed carries no cutoff", () => {
    const seed: GatheringFormSeed = {
      ...lastGatheringSeed(),
      rsvpCutoff: undefined,
    };
    const { result } = renderHook(() => useGatheringForm({ seed }));

    // The seed's family is `eat`, whose default closes a day ahead.
    expect(result.current.rsvpCutoff).toBe("day-before");
    expect(result.current.isRsvpCutoffTouched).toBe(false);

    act(() => result.current.selectFormat("party", "club-night"));
    expect(result.current.rsvpCutoff).toBe("one-hour-before");
  });
});

describe("useGatheringForm draft snapshot", () => {
  it("round-trips through JSON and restores every field it carries", () => {
    const source = renderHook(() => useGatheringForm());

    act(() => source.result.current.setTitle("Sunday picnic"));
    act(() => source.result.current.selectFormat("eat", "potluck"));
    act(() => source.result.current.setFormatDetail("bring", "fruit"));
    act(() => source.result.current.setDate(futureDate(12)));
    act(() => source.result.current.setTime("13:00"));
    act(() => source.result.current.setHood("Graça"));
    act(() => source.result.current.toggleTheme("family-friendly"));
    act(() => source.result.current.toggleContentNote("alcohol-present"));
    act(() => source.result.current.setHouseRules("Bring a blanket"));
    act(() => source.result.current.setCostKind("pay-what-you-can"));
    act(() => source.result.current.toggleRsvpQuestion("dietary"));
    act(() => source.result.current.setAllowWaitlist(false));
    act(() => source.result.current.toggleCheck(0));
    act(() => source.result.current.setCoverImageUrl("event-covers/a.webp"));
    act(() => source.result.current.toggleCohost(ARI_PICK));

    const snapshot = source.result.current.draftSnapshot;
    const stored = JSON.parse(JSON.stringify(snapshot)) as typeof snapshot;
    expect(stored).toEqual(snapshot);
    expect("checks" in snapshot).toBe(false);
    expect("coverImageUrl" in snapshot).toBe(false);
    expect("cohosts" in snapshot).toBe(false);
    expect("cohostSlugs" in snapshot).toBe(false);

    const restored = renderHook(() => useGatheringForm());
    act(() => restored.result.current.restoreDraft(stored));

    expect(restored.result.current.draftSnapshot).toEqual(snapshot);
    expect(restored.result.current.checks).toEqual([false, false]);
    expect(restored.result.current.coverImageUrl).toBe("");
    expect(restored.result.current.cohosts).toEqual([]);
    expect(restored.result.current.cohostSlugs).toEqual([]);
    expect(restored.result.current.dirty).toBe(true);
  });

  it("round-trips When it ends as null through storage", () => {
    const source = renderHook(() => useGatheringForm());

    act(() => source.result.current.selectFormat("eat", "potluck"));
    act(() => source.result.current.setRsvpCutoff(null));

    const snapshot = source.result.current.draftSnapshot;
    expect(snapshot.rsvpCutoff).toBeNull();
    const stored = JSON.parse(JSON.stringify(snapshot)) as typeof snapshot;

    const restored = renderHook(() => useGatheringForm());
    act(() => restored.result.current.restoreDraft(stored));

    expect(restored.result.current.rsvpCutoff).toBeNull();
    expect(restored.result.current.isRsvpCutoffTouched).toBe(true);

    act(() => restored.result.current.selectFormat("party", "club-night"));
    expect(restored.result.current.rsvpCutoff).toBeNull();
  });

  it("restores a cutoff this release does not know as the family default", () => {
    const blank = renderHook(() => useGatheringForm());
    const { result } = renderHook(() => useGatheringForm());

    act(() =>
      result.current.restoreDraft({
        ...blank.result.current.draftSnapshot,
        family: "eat",
        format: "potluck",
        rsvpCutoff: "two-weeks-before" as unknown as RsvpCutoff,
      }),
    );

    expect(result.current.rsvpCutoff).toBe("day-before");
  });

  it("keeps a restored value over the family default", () => {
    const blank = renderHook(() => useGatheringForm());
    const { isRsvpCutoffTouched, isCapTouched, ...withoutFlags } =
      blank.result.current.draftSnapshot;
    expect(isRsvpCutoffTouched).toBe(false);
    expect(isCapTouched).toBe(false);

    const { result } = renderHook(() => useGatheringForm());
    act(() =>
      result.current.restoreDraft({
        ...withoutFlags,
        family: "eat",
        format: "potluck",
        cap: "7",
        rsvpCutoff: "one-hour-before",
      }),
    );
    act(() => result.current.selectFormat("eat", "supper-club"));

    expect(result.current.rsvpCutoff).toBe("one-hour-before");
    expect(result.current.cap).toBe("7");
  });

  it("drops a restored theme the restored family already asks about", () => {
    const blank = renderHook(() => useGatheringForm());
    const { result } = renderHook(() => useGatheringForm());

    act(() =>
      result.current.restoreDraft({
        ...blank.result.current.draftSnapshot,
        family: "party",
        format: "club-night",
        themes: ["sober", "sapphic"],
      }),
    );

    expect(result.current.themes).toEqual(["sapphic"]);
  });

  it("clears a restored format from another family and an unknown language", () => {
    const blank = renderHook(() => useGatheringForm());
    const { result } = renderHook(() => useGatheringForm());

    act(() =>
      result.current.restoreDraft({
        ...blank.result.current.draftSnapshot,
        family: "eat",
        format: "club-night",
        lang: "A language this release does not offer",
      }),
    );

    expect(result.current.family).toBe("eat");
    expect(result.current.format).toBe("");
    expect(result.current.lang).toBe(LANGS[0]?.value);
  });

  it("keeps a restored format inside its family, and something else", () => {
    const blank = renderHook(() => useGatheringForm());
    const curated = renderHook(() => useGatheringForm());
    const somethingElse = renderHook(() => useGatheringForm());

    act(() =>
      curated.result.current.restoreDraft({
        ...blank.result.current.draftSnapshot,
        family: "eat",
        format: "potluck",
        lang: "English only",
      }),
    );
    act(() =>
      somethingElse.result.current.restoreDraft({
        ...blank.result.current.draftSnapshot,
        family: "eat",
        format: "other",
        otherText: "Soup swap",
      }),
    );

    expect(curated.result.current.format).toBe("potluck");
    expect(curated.result.current.lang).toBe("English only");
    expect(somethingElse.result.current.format).toBe("other");
    expect(somethingElse.result.current.otherText).toBe("Soup swap");
  });
});
