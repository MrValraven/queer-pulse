import { describe, expect, it, vi } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import type {
  EventBatchTemplateDTO,
  EventBatchTemplateOption,
} from "../api/eventBatch.api";
import { ONLINE_HOOD_VALUE } from "../steps/dateNotes.data";
import type { AddMonthSummaryOverrides } from "./addMonthSummary";
import {
  templateDropNotices,
  templateOptionDate,
  templateSummaryRows,
} from "./addMonthSummary";

/** A `t` that echoes the key and the values it was handed. */
const echoTranslate = (): TFunction =>
  vi.fn((key: string, values?: Record<string, unknown>) =>
    values === undefined ? key : `${key}|${JSON.stringify(values)}`,
  );

const template: EventBatchTemplateDTO = {
  slug: "drag-night",
  title: "Drag Night",
  description: "A night of drag.",
  timezone: "Europe/Lisbon",
  startTime: "21:00",
  endTime: "23:30",
  coverImageUrl: null,
  gatheringFamily: "watch",
  eventType: "Drag show",
  formatDetails: null,
  neighbourhood: null,
  venue: "Bar Lua",
  listingId: null,
  venueListing: null,
  isOnline: false,
  onlineUrl: null,
  address: "Rua da Rosa 1",
  arrivalNotes: null,
  capacity: 40,
  language: "en",
  cost: "10 EUR",
  costKind: "fixed",
  paymentUrl: null,
  paymentInstructions: "Pay at the door",
  accessibility: { answers: { "step-free-entrance": "yes" }, note: "" },
  visibility: "members",
  community: { slug: "queer-runners", name: "Queer Runners" },
  communityDropped: null,
  runByListing: null,
  runByDropped: null,
  venueListingDropped: false,
  themes: [],
  contentNotes: [],
  houseRules: null,
  rsvpCutoff: "one-hour-before",
  rsvpQuestions: { dietary: false, pronouns: false, access: true },
  customRsvpQuestion: null,
  allowWaitlist: false,
  showAttendeeCount: true,
};

const none: AddMonthSummaryOverrides = {
  place: null,
  cost: null,
  times: { startTime: "21:00", endTime: "23:30" },
};

function valueOf(
  rows: ReturnType<typeof templateSummaryRows>,
  id: string,
): string | undefined {
  return rows.find((row) => row.id === id)?.value;
}

describe("templateSummaryRows", () => {
  it("lists format, place, times, cost, payment, RSVP cutoff, capacity, visibility, community, run by, care notes, house rules and accessibility in that order", () => {
    expect(
      templateSummaryRows(template, none, echoTranslate()).map((row) => row.id),
    ).toEqual([
      "format",
      "place",
      "times",
      "cost",
      "payment",
      "rsvpCutoff",
      "capacity",
      "visibility",
      "community",
      "runBy",
      "careNotes",
      "houseRules",
      "accessibility",
    ]);
  });

  it("reads the edited place and cost over the template's", () => {
    const rows = templateSummaryRows(
      template,
      {
        ...none,
        place: {
          hood: "",
          venue: "Casa Bota",
          venueListingId: null,
          venueListing: null,
          address: "",
          directions: "",
          onlineUrl: "",
        },
        cost: {
          costKind: "pay-what-you-can",
          cost: "5 to 15 EUR",
          paymentUrl: "",
          paymentInstructions: "",
        },
      },
      echoTranslate(),
    );
    expect(valueOf(rows, "place")).toBe("Casa Bota");
    expect(valueOf(rows, "cost")).toBe(
      "gatherings:extras.costKind.payWhatYouCan · 5 to 15 EUR",
    );
    expect(valueOf(rows, "payment")).toBe(
      "gatherings:addMonth.template.summary.none",
    );
  });

  it("reads an online place as Online", () => {
    const rows = templateSummaryRows(
      { ...template, isOnline: true, venue: null, onlineUrl: "https://x.io" },
      none,
      echoTranslate(),
    );
    expect(valueOf(rows, "place")).toBe("gatherings:addMonth.template.online");
    const editedRows = templateSummaryRows(
      template,
      {
        ...none,
        place: {
          hood: ONLINE_HOOD_VALUE,
          venue: "",
          venueListingId: null,
          venueListing: null,
          address: "",
          directions: "",
          onlineUrl: "https://x.io",
        },
      },
      echoTranslate(),
    );
    expect(valueOf(editedRows, "place")).toBe(
      "gatherings:addMonth.template.online",
    );
  });

  it("reads a missing capacity as no limit and a missing community as none", () => {
    const rows = templateSummaryRows(
      { ...template, capacity: null, community: null },
      none,
      echoTranslate(),
    );
    expect(valueOf(rows, "capacity")).toBe(
      "gatherings:addMonth.template.summary.noLimit",
    );
    expect(valueOf(rows, "community")).toBe(
      "gatherings:addMonth.template.summary.none",
    );
  });

  it("reads a legacy template with a written cost and no kind as its written price", () => {
    const rows = templateSummaryRows(
      { ...template, costKind: null, cost: "8 EUR" },
      none,
      echoTranslate(),
    );
    expect(valueOf(rows, "cost")).toBe("8 EUR");
    expect(valueOf(rows, "payment")).toBe("Pay at the door");
  });

  it("reads a place with no venue by its address", () => {
    const rows = templateSummaryRows(
      { ...template, venue: null, address: "Rua da Rosa 1" },
      none,
      echoTranslate(),
    );
    expect(valueOf(rows, "place")).toBe("Rua da Rosa 1");
  });

  it("reads the shared times with and without an end", () => {
    const translate = echoTranslate();
    expect(
      valueOf(templateSummaryRows(template, none, translate), "times"),
    ).toBe(
      'gatherings:addMonth.template.summary.times|{"start":"21:00","end":"23:30"}',
    );
    const noEnd = { ...none, times: { startTime: "20:00", endTime: null } };
    expect(
      valueOf(templateSummaryRows(template, noEnd, translate), "times"),
    ).toBe('gatherings:addMonth.template.summary.timesNoEnd|{"start":"20:00"}');
  });
});

describe("templateDropNotices", () => {
  it("names the dropped run by, community and venue link in their own words", () => {
    expect(
      templateDropNotices(
        {
          ...template,
          runByDropped: { name: "Bar Lua", reason: "notManager" },
        },
        echoTranslate(),
      ),
    ).toEqual([
      'gatherings:addMonth.template.notice.runBy.notManager|{"name":"Bar Lua"}',
    ]);
    expect(
      templateDropNotices(
        {
          ...template,
          communityDropped: { name: "Queer Runners", reason: "unavailable" },
          venueListingDropped: true,
        },
        echoTranslate(),
      ),
    ).toEqual([
      'gatherings:addMonth.template.notice.community.unavailable|{"name":"Queer Runners"}',
      'gatherings:addMonth.template.notice.venueLink|{"venue":"Bar Lua"}',
    ]);
  });

  it("falls back to the unnamed copy when a dropped name is blank", () => {
    expect(
      templateDropNotices(
        {
          ...template,
          venue: null,
          runByDropped: { name: "", reason: "unavailable" },
          communityDropped: { name: " ", reason: "notModerator" },
          venueListingDropped: true,
        },
        echoTranslate(),
      ),
    ).toEqual([
      "gatherings:addMonth.template.notice.runBy.unavailableUnnamed",
      "gatherings:addMonth.template.notice.community.notModeratorUnnamed",
      "gatherings:addMonth.template.notice.venueLinkUnnamed",
    ]);
  });

  it("leaves out the venue link notice once the host has edited the place", () => {
    expect(
      templateDropNotices(
        { ...template, venueListingDropped: true },
        echoTranslate(),
        {
          hood: "",
          venue: "Casa Bota",
          venueListingId: null,
          venueListing: null,
          address: "",
          directions: "",
          onlineUrl: "",
        },
      ),
    ).toEqual([]);
  });

  it("returns zero notices when nothing was dropped", () => {
    expect(templateDropNotices(template, echoTranslate())).toEqual([]);
  });
});

describe("templateOptionDate", () => {
  const option: EventBatchTemplateOption = {
    slug: "drag-night",
    title: "Drag Night",
    startAt: "2026-11-07T23:30:00Z",
    timezone: "Asia/Tokyo",
    place: "Bar Lua",
    isOnline: false,
    coverImageUrl: null,
  };

  const nowIn2026 = new Date("2026-11-02T12:00:00Z");

  it("reads the start day on the wall clock of the event's own zone", () => {
    expect(templateOptionDate(option, "en", nowIn2026)).toBe("Sun 8 Nov");
  });

  it("adds the year when the event falls in another year", () => {
    expect(
      templateOptionDate(
        { ...option, startAt: "2025-11-07T12:00:00Z" },
        "en",
        nowIn2026,
      ),
    ).toBe("Fri 7 Nov 2025");
  });

  it("reads an unreadable start as empty", () => {
    expect(templateOptionDate({ ...option, startAt: "soon" }, "en")).toBe("");
  });
});
