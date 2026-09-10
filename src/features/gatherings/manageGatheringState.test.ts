import { beforeAll, describe, expect, it } from "vitest";
import {
  applyEditDraft,
  buildEditPatch,
  canSaveEditDraft,
  editDraftFormatFields,
  editScheduleProblem,
  type GatheringState,
} from "./manageGatheringState";
import type { GatheringDetailsDraft } from "./EditDetailsModal";
import { createFormatters } from "../../shared/i18n/format";
import { catalogs, loadNamespace } from "../../shared/i18n/catalogs";
import type { Catalog, TFunction } from "../../shared/i18n/types";

/**
 * The manage dashboard's edit layer, covering the trap this end field exists
 * for: a host who moves a 23:00 start to 06:00 pushes it past the stored end,
 * and before the end was editable the only answer was a 400 with nothing on
 * the form to change.
 *
 * Every date here is a local `"yyyy-mm-ddThh:mm"` wire value, the shape
 * `DatePicker`'s `datetime` mode reads and writes, so the expectations are
 * built from `new Date(...)` on the same strings rather than from hardcoded
 * UTC, and the suite reads the same in any timezone.
 */

/** A minimal `t` over the real `en` catalog, matching `gatheringSchedule.test.ts`,
 *  so a key that goes missing fails here too. */
let gatheringsCatalog: Catalog = catalogs.en.gatherings;
beforeAll(async () => {
  gatheringsCatalog = await loadNamespace("en", "gatherings");
});

const t: TFunction = (key, options) => {
  const [, path] = key.split(":");
  const value = gatheringsCatalog[path ?? ""] ?? key;
  return Object.entries(options ?? {}).reduce(
    (accumulated, [token, replacement]) =>
      accumulated.replace(`{${token}}`, String(replacement)),
    value,
  );
};
const fmt = createFormatters("en-GB");

const BASE_START = "2026-10-17T23:00";
const BASE_END = "2026-10-18T04:00";

function draftOf(
  overrides: Partial<GatheringDetailsDraft> = {},
): GatheringDetailsDraft {
  return {
    title: "Autumn supper",
    startAt: BASE_START,
    endAt: BASE_END,
    location: "Arroios",
    description: "A long table and a slow evening.",
    visibility: "members",
    communitySlug: "",
    // Neutral by default: an unclassified gathering, which is what every case
    // about the schedule is about.
    gatheringFamily: "",
    format: "",
    otherText: "",
    formatDetails: {},
    ...overrides,
  };
}

function stateOf(overrides: Partial<GatheringState> = {}): GatheringState {
  return {
    title: "Autumn supper",
    date: "Saturday, 17 October 2026",
    startAt: new Date(BASE_START),
    endAt: new Date(BASE_END),
    location: "Arroios",
    description: "A long table and a slow evening.",
    details: [
      {
        id: "date",
        labelKey: "gatherings:manage.details.date",
        value: "Saturday, 17 October 2026",
      },
      {
        id: "venue",
        labelKey: "gatherings:manage.details.venue",
        value: "Arroios",
      },
    ],
    venueListingId: null,
    venueListing: null,
    visibility: "members",
    communitySlug: "",
    gatheringFamily: null,
    eventType: null,
    formatDetails: null,
    ...overrides,
  };
}

describe("buildEditPatch", () => {
  it("sends the stated end as an ISO instant", () => {
    const patch = buildEditPatch(stateOf(), draftOf());
    expect(patch.endAt).toBe(new Date(BASE_END).toISOString());
    expect(patch.startAt).toBe(new Date(BASE_START).toISOString());
  });

  it("sends an explicit null when the host cleared the end", () => {
    const patch = buildEditPatch(stateOf(), draftOf({ endAt: "" }));
    // Explicitly null rather than absent: the backend reads
    // `dto.endAt !== undefined` as "change it", so an omitted key would leave
    // the stored end in place and the clear would silently do nothing.
    expect(patch.endAt).toBeNull();
    expect("endAt" in patch).toBe(true);
  });

  it("still sends the end when only the start moved", () => {
    // The backend validates the RESULTING schedule, so a patch that moves the
    // start has to carry the end that goes with it.
    const patch = buildEditPatch(
      stateOf(),
      draftOf({ startAt: "2026-10-17T21:00" }),
    );
    expect(patch.endAt).toBe(new Date(BASE_END).toISOString());
  });

  it("sends the host's own words as the format when they picked something else", () => {
    const patch = buildEditPatch(
      stateOf(),
      draftOf({
        gatheringFamily: "make",
        format: "other",
        otherText: "  Risograph afternoon  ",
      }),
    );
    expect(patch.gatheringFamily).toBe("make");
    expect(patch.eventType).toBe("Risograph afternoon");
  });

  it("drops a detail answer the patched family does not ask for", () => {
    const patch = buildEditPatch(
      stateOf(),
      draftOf({
        gatheringFamily: "watch",
        format: "screening",
        formatDetails: { bring: "a blanket", runtimeMinutes: 96 },
      }),
    );
    // `watch` asks how long the film runs and nothing else, so the answer to
    // a question this family never put goes with the family it belonged to.
    expect(patch.formatDetails).toEqual({ runtimeMinutes: 96 });
  });

  it("un-classifies a gathering with an explicit null", () => {
    const patch = buildEditPatch(
      stateOf({ gatheringFamily: "eat", eventType: "supper-club" }),
      draftOf(),
    );
    // Explicitly null rather than absent: the backend reads an absent key as
    // "leave it alone", so clearing the family has to say so on the wire.
    expect(patch.gatheringFamily).toBeNull();
    expect("gatheringFamily" in patch).toBe(true);
    expect(patch.eventType).toBeNull();
    expect(patch.formatDetails).toBeNull();
  });
});

describe("editDraftFormatFields", () => {
  it("opens the modal on the stored curated format", () => {
    const fields = editDraftFormatFields(
      stateOf({ gatheringFamily: "eat", eventType: "supper-club" }),
    );
    expect(fields).toEqual({
      gatheringFamily: "eat",
      format: "supper-club",
      otherText: "",
      formatDetails: {},
    });
  });

  it("opens the modal on 'something else' with the host's own words kept", () => {
    // A stored value that is not a catalog key is the host's sentence, and a
    // blank select would drop it on the next save.
    const fields = editDraftFormatFields(
      stateOf({ gatheringFamily: "make", eventType: "Risograph afternoon" }),
    );
    expect(fields.format).toBe("other");
    expect(fields.otherText).toBe("Risograph afternoon");
  });
});

describe("applyEditDraft", () => {
  it("folds the end into the dashboard's own state", () => {
    const next = applyEditDraft(
      stateOf(),
      draftOf({ endAt: "2026-10-19T04:00" }),
      fmt,
      t,
    );
    expect(next.endAt).toEqual(new Date("2026-10-19T04:00"));
    // Two days apart earns a date range on the dashboard's date row, so a
    // festival's own host is not told it runs for one afternoon.
    expect(next.date).toContain("19");
    expect(next.details.find((detail) => detail.id === "date")?.value).toBe(
      next.date,
    );
  });

  it("folds the saved family and format into the dashboard's own state", () => {
    // So a second edit in the same session opens on what the first one saved.
    const next = applyEditDraft(
      stateOf(),
      draftOf({ gatheringFamily: "eat", format: "potluck" }),
      fmt,
      t,
    );
    expect(next.gatheringFamily).toBe("eat");
    expect(next.eventType).toBe("potluck");
  });

  it("folds a cleared end back to null", () => {
    const next = applyEditDraft(stateOf(), draftOf({ endAt: "" }), fmt, t);
    expect(next.endAt).toBeNull();
  });
});

describe("the moved-start trap", () => {
  it("refuses a start moved past the existing end, rather than sending it", () => {
    // The bug in one line: the gathering ran 23:00 to 04:00 and the host moves
    // the start to 06:00 the same morning, which lands after the stored end.
    const draft = draftOf({ startAt: "2026-10-18T06:00" });
    expect(editScheduleProblem(draft)).toBe("endBeforeStart");
    expect(canSaveEditDraft(draft)).toBe(false);
  });

  it("lets the host escape by moving the end too", () => {
    const draft = draftOf({
      startAt: "2026-10-18T06:00",
      endAt: "2026-10-18T11:00",
    });
    expect(editScheduleProblem(draft)).toBeNull();
    expect(canSaveEditDraft(draft)).toBe(true);
  });
});

describe("editScheduleProblem", () => {
  it("accepts a gathering with no stated end", () => {
    expect(editScheduleProblem(draftOf({ endAt: "" }))).toBeNull();
    expect(canSaveEditDraft(draftOf({ endAt: "" }))).toBe(true);
  });

  it("refuses an end at exactly the start", () => {
    expect(editScheduleProblem(draftOf({ endAt: BASE_START }))).toBe(
      "endBeforeStart",
    );
  });

  // MAX_GATHERING_SPAN_DAYS is 14, so these two sit in January, clear of the
  // daylight-saving change that would make a fortnight measured on the wall
  // clock an hour longer than a fortnight measured in elapsed time.
  it("accepts a span of exactly the maximum", () => {
    const draft = draftOf({
      startAt: "2026-01-10T09:00",
      endAt: "2026-01-24T09:00",
    });
    expect(editScheduleProblem(draft)).toBeNull();
    expect(canSaveEditDraft(draft)).toBe(true);
  });

  it("refuses a span past the maximum by hours the calendar cannot see", () => {
    // Elapsed milliseconds, never calendar days: 09:00 on the 10th to 23:00 on
    // the 24th is fourteen days on the calendar and fourteen days plus
    // fourteen hours on the clock, which is what the backend measures.
    const draft = draftOf({
      startAt: "2026-01-10T09:00",
      endAt: "2026-01-24T23:00",
    });
    expect(editScheduleProblem(draft)).toBe("spanTooLong");
    expect(canSaveEditDraft(draft)).toBe(false);
  });

  it("holds the save when a field a gathering cannot go without is empty", () => {
    expect(canSaveEditDraft(draftOf({ title: "  " }))).toBe(false);
    expect(canSaveEditDraft(draftOf({ location: "" }))).toBe(false);
    expect(canSaveEditDraft(draftOf({ startAt: "" }))).toBe(false);
  });

  it("holds the save when 'something else' is picked with no words in it", () => {
    // Blank, the save would send a null `eventType` and silently clear the
    // stored format while the box on screen still says the host picked their
    // own words. Mirrors the wizard's `isFormatChosen`.
    const blank = draftOf({
      gatheringFamily: "make",
      format: "other",
      otherText: "   ",
    });
    expect(canSaveEditDraft(blank)).toBe(false);
    expect(
      canSaveEditDraft({ ...blank, otherText: "Risograph afternoon" }),
    ).toBe(true);
    // A gathering that names no format at all is still saveable.
    expect(canSaveEditDraft(draftOf())).toBe(true);
  });
});
