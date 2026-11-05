import { describe, expect, it } from "vitest";
import { itemFieldMeta } from "./subprofileEditor.data";

describe("itemFieldMeta for the gigs date", () => {
  it.each(["musician", "dj", "vocalist"] as const)(
    "is a day picker for a %s gig",
    (kind) => {
      expect(itemFieldMeta("date", "gigs", kind)?.inputType).toBe("date");
    },
  );

  it("keeps the month picker for a drag artist's shows", () => {
    expect(itemFieldMeta("date", "shows", "drag")?.inputType).toBe("month");
  });
});

describe("itemFieldMeta for event and night dates", () => {
  it("is a day picker for an event producer's events", () => {
    expect(itemFieldMeta("date", "events", "event_producer")?.inputType).toBe(
      "date",
    );
  });

  it("is a day picker for a promoter's nights", () => {
    expect(itemFieldMeta("date", "nights", "promoter")?.inputType).toBe("date");
  });

  it.each(["florist", "tournament_organizer"] as const)(
    "keeps the month picker for a %s's events",
    (kind) => {
      expect(itemFieldMeta("date", "events", kind)?.inputType).toBe("month");
    },
  );

  it("keeps the month picker for a game night host's nights", () => {
    expect(itemFieldMeta("date", "nights", "game_night_host")?.inputType).toBe(
      "month",
    );
  });

  it("keeps the date label and placeholder from the base field", () => {
    const eventDateField = itemFieldMeta("date", "events", "event_producer");
    const baseDateField = itemFieldMeta("date", "events", "florist");
    expect(eventDateField?.labelKey).toBe(baseDateField?.labelKey);
    expect(eventDateField?.placeholderKey).toBe(baseDateField?.placeholderKey);
  });
});

describe("itemFieldMeta for the line-up field", () => {
  it.each([
    ["event_producer", "events"],
    ["promoter", "nights"],
  ] as const)("is worded as the line-up for a %s's %s", (kind, section) => {
    const lineUpField = itemFieldMeta("meta", section, kind);
    expect(lineUpField?.labelKey).toBe("subprofiles:itemField.lineUp.label");
    expect(lineUpField?.placeholderKey).toBe(
      "subprofiles:itemField.lineUp.placeholder",
    );
  });

  it.each([
    ["florist", "events"],
    ["game_night_host", "nights"],
  ] as const)("keeps the default wording for a %s's %s", (kind, section) => {
    const metaField = itemFieldMeta("meta", section, kind);
    expect(metaField?.labelKey).toBe("subprofiles:field.meta.label");
    expect(metaField?.placeholderKey).toBe(
      "subprofiles:field.meta.placeholder",
    );
  });
});
