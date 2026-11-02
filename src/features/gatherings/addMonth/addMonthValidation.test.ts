import { describe, expect, it } from "vitest";
import type { EventBatchRowDto } from "../api/eventBatch.api";
import { ONLINE_HOOD_VALUE } from "../steps/dateNotes.data";
import {
  MAX_DESCRIPTION_STORAGE_LENGTH,
  MAX_TITLE_LENGTH,
} from "../steps/whatChapter.data";
import { EVENT_BATCH_MAX_ROWS } from "./addMonth.data";
import {
  EMPTY_ADD_MONTH_STATE,
  type AddMonthRow,
  type AddMonthState,
  type AddMonthTimes,
} from "./addMonthState";
import {
  firstInvalidRowDate,
  isOverSizeLimit,
  isSharedValid,
  issuesByDate,
  publishBlock,
  rowIssues,
  serverIssueFor,
} from "./addMonthValidation";

const now = { date: "2026-11-02", time: "20:00" };
const times: AddMonthTimes = { startTime: "22:00", endTime: "03:00" };

const row: AddMonthRow = {
  date: "2026-11-07",
  title: "Drag night",
  description: "Lip sync",
  photo: null,
  timeOverride: null,
};

const state: AddMonthState = {
  ...EMPTY_ADD_MONTH_STATE,
  templateSlug: "drag-night",
  timesTemplateSlug: "drag-night",
  times,
  rows: [row, { ...row, date: "2026-11-21", title: "Bingo" }],
  pledges: [true, true],
};

/** A month at every cap: 31 rows, each title and description at its longest,
 *  each with its own photo key and its own times. */
const fullMonth = (character: string): AddMonthState => ({
  ...state,
  rows: Array.from({ length: EVENT_BATCH_MAX_ROWS }, (_unused, index) => ({
    date: `2026-12-${String(index + 1).padStart(2, "0")}`,
    title: character.repeat(MAX_TITLE_LENGTH),
    description: character.repeat(MAX_DESCRIPTION_STORAGE_LENGTH),
    photo: {
      key: `uploads/event-cover/month-photo-${index + 1}.jpg`,
      previewUrl: null,
    },
    timeOverride: { startTime: "21:30", endTime: "02:00" },
  })),
});

describe("rowIssues", () => {
  it("names a missing title and a missing description", () => {
    expect(
      rowIssues({ ...row, title: " ", description: "" }, times, now),
    ).toEqual([
      { field: "title", problem: "titleMissing" },
      { field: "description", problem: "descriptionMissing" },
    ]);
  });

  it("flags today's row when its start has passed in the template zone", () => {
    expect(
      rowIssues(
        { ...row, date: "2026-11-02" },
        { startTime: "19:00", endTime: null },
        now,
      ),
    ).toContainEqual({ field: "startTime", problem: "startPassed" });
    expect(
      rowIssues(
        { ...row, date: "2026-11-02" },
        { startTime: "21:00", endTime: null },
        now,
      ),
    ).toEqual([]);
  });

  it("flags a start on the current minute as passed", () => {
    expect(
      rowIssues(
        { ...row, date: "2026-11-02" },
        { startTime: "20:00", endTime: null },
        now,
      ),
    ).toEqual([{ field: "startTime", problem: "startPassed" }]);
  });

  it("flags a date before today whatever its start, as a draft restored days later holds", () => {
    expect(
      rowIssues(
        { ...row, date: "2026-10-30" },
        { startTime: "23:30", endTime: null },
        now,
      ),
    ).toEqual([{ field: "startTime", problem: "startPassed" }]);
  });

  it("reads a row's own start before the shared one", () => {
    const today = { ...row, date: "2026-11-02" };
    expect(
      rowIssues(
        { ...today, timeOverride: { startTime: "21:00", endTime: null } },
        { startTime: "19:00", endTime: null },
        now,
      ),
    ).toEqual([]);
    expect(
      rowIssues(
        { ...today, timeOverride: { startTime: "19:00", endTime: null } },
        { startTime: "21:00", endTime: null },
        now,
      ),
    ).toEqual([{ field: "startTime", problem: "startPassed" }]);
  });
});

describe("issuesByDate", () => {
  it("lists only the cards with something wrong, by date", () => {
    const withGaps: AddMonthState = {
      ...state,
      rows: [row, { ...row, date: "2026-11-21", title: "" }],
    };
    expect(issuesByDate(withGaps, now)).toEqual({
      "2026-11-21": [{ field: "title", problem: "titleMissing" }],
    });
  });
});

describe("isSharedValid", () => {
  const place = {
    hood: ONLINE_HOOD_VALUE,
    venue: "",
    venueListingId: null,
    venueListing: null,
    address: "",
    directions: "",
    onlineUrl: "https://meet.example/a",
  };

  it("passes a month that keeps the starting event's place and cost", () => {
    expect(isSharedValid(state)).toBe(true);
  });

  it("refuses an edited online place with a broken join link", () => {
    expect(
      isSharedValid({ ...state, place: { ...place, onlineUrl: "meet me" } }),
    ).toBe(false);
    expect(isSharedValid({ ...state, place })).toBe(true);
  });

  it("refuses an edited paid cost with a payment link the server would refuse", () => {
    const cost = {
      costKind: "fixed" as const,
      cost: "10 EUR",
      paymentUrl: "http://pay.example/x",
      paymentInstructions: "",
    };
    expect(isSharedValid({ ...state, cost })).toBe(false);
    expect(isSharedValid({ ...state, cost: { ...cost, paymentUrl: "" } })).toBe(
      true,
    );
    expect(
      isSharedValid({ ...state, cost: { ...cost, costKind: "free" } }),
    ).toBe(true);
  });
});

describe("publishBlock", () => {
  it("blocks publishing in the order a host fixes things", () => {
    expect(publishBlock(EMPTY_ADD_MONTH_STATE, {}, null)).toEqual({
      reason: "noTemplate",
    });
    expect(
      publishBlock({ ...EMPTY_ADD_MONTH_STATE, templateSlug: "a" }, {}, "a"),
    ).toEqual({
      reason: "noDates",
    });
    const brokenLink: AddMonthState = {
      ...state,
      place: {
        hood: ONLINE_HOOD_VALUE,
        venue: "",
        venueListingId: null,
        venueListing: null,
        address: "",
        directions: "",
        onlineUrl: "meet me",
      },
    };
    expect(
      publishBlock(
        brokenLink,
        {
          "2026-11-07": [{ field: "title", problem: "titleMissing" }],
        },
        "drag-night",
      ),
    ).toEqual({ reason: "sharedInvalid" });
    expect(
      publishBlock(
        state,
        {
          "2026-11-07": [{ field: "title", problem: "titleMissing" }],
          "2026-11-21": [{ field: "startTime", problem: "startPassed" }],
        },
        "drag-night",
      ),
    ).toEqual({ reason: "rowsInvalid", invalidRowCount: 2 });
    expect(publishBlock(fullMonth("中"), {}, "drag-night")).toEqual({
      reason: "tooLarge",
    });
    expect(
      publishBlock(
        { ...fullMonth("a"), pledges: [true, false] },
        {},
        "drag-night",
      ),
    ).toEqual({ reason: "pledgesOpen" });
    expect(publishBlock(state, {}, "drag-night")).toBeNull();
  });

  it("waits while a newly picked starting event loads", () => {
    const pickedState: AddMonthState = { ...state, templateSlug: "bingo" };
    expect(publishBlock(pickedState, {}, "drag-night")).toEqual({
      reason: "templateLoading",
    });
    expect(publishBlock(pickedState, {}, null)).toEqual({
      reason: "templateLoading",
    });
    expect(
      publishBlock({ ...pickedState, rows: [] }, {}, "drag-night"),
    ).toEqual({ reason: "templateLoading" });
    expect(publishBlock(pickedState, {}, "bingo")).toBeNull();
  });

  it("counts only the cards the page still shows", () => {
    expect(
      publishBlock(
        state,
        {
          "2026-11-30": [{ field: "title", problem: "titleMissing" }],
        },
        "drag-night",
      ),
    ).toBeNull();
  });

  it("passes an all-ASCII 31-row month at the maximum lengths", () => {
    expect(isOverSizeLimit(fullMonth("a"))).toBe(false);
    expect(publishBlock(fullMonth("a"), {}, "drag-night")).toBeNull();
  });

  it("blocks a 31-row month of 3-byte characters at the maximum lengths", () => {
    expect(isOverSizeLimit(fullMonth("中"))).toBe(true);
    expect(publishBlock(fullMonth("中"), {}, "drag-night")).toEqual({
      reason: "tooLarge",
    });
  });

  it("isOverSizeLimit reads a state without a template as under the limit", () => {
    expect(isOverSizeLimit(EMPTY_ADD_MONTH_STATE)).toBe(false);
  });
});

describe("firstInvalidRowDate", () => {
  it("firstInvalidRowDate returns the earliest date with an issue", () => {
    const threeRows: AddMonthState = {
      ...state,
      rows: [
        row,
        { ...row, date: "2026-11-14" },
        { ...row, date: "2026-11-21" },
      ],
    };
    expect(
      firstInvalidRowDate(threeRows, {
        "2026-11-21": [{ field: "title", problem: "titleMissing" }],
        "2026-11-14": [{ field: "description", problem: "descriptionMissing" }],
      }),
    ).toBe("2026-11-14");
    expect(firstInvalidRowDate(threeRows, {})).toBeNull();
  });
});

describe("serverIssueFor", () => {
  const sent = [
    { date: "2026-11-07" },
    { date: "2026-11-21" },
  ] as EventBatchRowDto[];

  it("serverIssueFor finds the card by its date before its index", () => {
    expect(
      serverIssueFor(
        {
          code: "EVENT_BATCH_DATE_IN_PAST",
          rowIndex: 0,
          field: "startTime",
          date: "2026-11-21",
        },
        sent,
        state,
      ),
    ).toEqual({
      date: "2026-11-21",
      issue: { field: "startTime", problem: "server" },
    });
  });

  it("serverIssueFor falls back to the sent row at rowIndex when the date matches no card", () => {
    expect(
      serverIssueFor(
        {
          code: "EVENT_BATCH_DATE_TOO_FAR",
          rowIndex: 0,
          field: "date",
          date: "2027-12-01",
        },
        sent,
        state,
      ),
    ).toEqual({
      date: "2026-11-07",
      issue: { field: "date", problem: "server" },
    });
  });

  it("serverIssueFor returns null when neither the date nor the index matches a card", () => {
    expect(
      serverIssueFor(
        {
          code: "EVENT_BATCH_ROW_INVALID",
          rowIndex: 5,
          field: "endTime",
          date: "2027-12-01",
        },
        sent,
        state,
      ),
    ).toBeNull();
    const withoutSentRow: AddMonthState = {
      ...state,
      rows: [state.rows[1] ?? row],
    };
    expect(
      serverIssueFor(
        {
          code: "EVENT_BATCH_ROW_INVALID",
          rowIndex: 0,
          field: "endTime",
          date: "2027-12-01",
        },
        sent,
        withoutSentRow,
      ),
    ).toBeNull();
  });
});
