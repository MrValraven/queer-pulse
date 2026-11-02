import { describe, expect, it } from "vitest";
import type { EventBatchTemplateDTO } from "../api/eventBatch.api";
import { ONLINE_HOOD_VALUE } from "../steps/dateNotes.data";
import {
  addMonthReducer,
  costKindOfTemplate,
  costValuesFromTemplate,
  EMPTY_ADD_MONTH_STATE,
  isRowStarted,
  placeValuesFromTemplate,
  type AddMonthRow,
  type AddMonthState,
} from "./addMonthState";

const template: EventBatchTemplateDTO = {
  slug: "queer-supper",
  title: "Queer supper",
  description: "A long table and a slow evening",
  timezone: "Europe/Lisbon",
  startTime: "19:30",
  endTime: "22:00",
  coverImageUrl: "https://cdn.example/cover.jpg",
  gatheringFamily: null,
  eventType: null,
  formatDetails: null,
  neighbourhood: "Arroios",
  venue: "Casa Comum",
  listingId: "listing-1",
  venueListing: { slug: "casa-comum", name: "Casa Comum" },
  isOnline: false,
  onlineUrl: null,
  address: "Rua de Arroios 12",
  arrivalNotes: "Ring the second bell",
  capacity: 20,
  language: "en",
  cost: null,
  costKind: null,
  paymentUrl: null,
  paymentInstructions: null,
  accessibility: { answers: {}, note: "" },
  visibility: "members",
  community: null,
  communityDropped: null,
  runByListing: null,
  runByDropped: null,
  venueListingDropped: false,
  themes: [],
  contentNotes: [],
  houseRules: null,
  rsvpCutoff: null,
  rsvpQuestions: { dietary: false, pronouns: false, access: false },
  customRsvpQuestion: null,
  allowWaitlist: false,
  showAttendeeCount: true,
};

const withDates = (...dates: string[]): AddMonthState =>
  dates.reduce(
    (state, date) => addMonthReducer(state, { type: "toggleDate", date }),
    EMPTY_ADD_MONTH_STATE,
  );

/** The first card, or a named failure when the state holds no rows. */
const firstRow = (state: AddMonthState): AddMonthRow => {
  const row = state.rows[0];
  if (!row) throw new Error("expected the state to hold at least one row");
  return row;
};

// 1 to 31 December 2026
const thirtyOneDates = Array.from(
  { length: 31 },
  (_unused, index) => `2026-12-${String(index + 1).padStart(2, "0")}`,
);

describe("addMonthReducer dates and templates", () => {
  it("starts empty at seven in the evening with no end", () => {
    expect(EMPTY_ADD_MONTH_STATE).toMatchObject({
      templateSlug: null,
      times: { startTime: "19:00", endTime: null },
      rows: [],
      stashedRows: {},
      pledges: [false, false],
    });
  });

  it("keeps rows in date order across months", () => {
    expect(
      withDates("2026-12-05", "2026-11-28", "2026-11-30").rows.map(
        (row) => row.date,
      ),
    ).toEqual(["2026-11-28", "2026-11-30", "2026-12-05"]);
  });

  it("refuses a 32nd date and leaves the 31 rows as they are", () => {
    const full = withDates(...thirtyOneDates);
    expect(full.rows).toHaveLength(31);
    const after = addMonthReducer(full, {
      type: "toggleDate",
      date: "2027-01-01",
    });
    expect(after.rows).toHaveLength(31);
    expect(after).toBe(full);
  });

  it("still removes a date when 31 are picked", () => {
    const full = withDates(...thirtyOneDates);
    expect(
      addMonthReducer(full, { type: "toggleDate", date: "2026-12-01" }).rows,
    ).toHaveLength(30);
  });

  it("re-selecting a removed date brings back what was typed on it", () => {
    let state = withDates("2026-11-07");
    state = addMonthReducer(state, {
      type: "editRow",
      date: "2026-11-07",
      patch: { title: "Drag night", description: "Half" },
    });
    state = addMonthReducer(state, { type: "toggleDate", date: "2026-11-07" });
    expect(state.rows).toHaveLength(0);
    expect(state.stashedRows["2026-11-07"]).toMatchObject({
      title: "Drag night",
    });
    state = addMonthReducer(state, { type: "toggleDate", date: "2026-11-07" });
    expect(state.rows[0]).toMatchObject({
      title: "Drag night",
      description: "Half",
    });
    expect(state.stashedRows).toEqual({});
  });

  it("forgets an empty row on removal", () => {
    expect(
      addMonthReducer(withDates("2026-11-07"), {
        type: "removeDate",
        date: "2026-11-07",
      }).stashedRows,
    ).toEqual({});
  });

  it("picking a new template resets the shared edits and keeps the rows", () => {
    let state = addMonthReducer(withDates("2026-11-07"), {
      type: "pickTemplate",
      slug: "a",
    });
    state = addMonthReducer(state, {
      type: "setSharedCoverKey",
      key: "uploads/x.jpg",
    });
    state = addMonthReducer(state, {
      type: "startEditingShared",
      place: placeValuesFromTemplate(template),
      cost: costValuesFromTemplate(template),
    });
    state = addMonthReducer(state, { type: "pickTemplate", slug: "b" });
    expect(state).toMatchObject({
      templateSlug: "b",
      sharedCover: null,
      place: null,
      cost: null,
    });
    expect(state.rows).toHaveLength(1);
  });

  it("picking the same template again keeps the shared edits", () => {
    let state = addMonthReducer(EMPTY_ADD_MONTH_STATE, {
      type: "pickTemplate",
      slug: "a",
    });
    state = addMonthReducer(state, {
      type: "setSharedCoverKey",
      key: "uploads/x.jpg",
    });
    state = addMonthReducer(state, { type: "pickTemplate", slug: "a" });
    expect(state.sharedCover).toEqual({
      key: "uploads/x.jpg",
      previewUrl: null,
    });
  });

  it("takes the template's times once per template so a restored draft keeps its own", () => {
    let state = addMonthReducer(EMPTY_ADD_MONTH_STATE, {
      type: "pickTemplate",
      slug: "drag",
    });
    state = addMonthReducer(state, {
      type: "applyTemplateTimes",
      template: {
        ...template,
        slug: "drag",
        startTime: "22:00",
        endTime: "03:00",
      },
    });
    expect(state.times).toEqual({ startTime: "22:00", endTime: "03:00" });
    expect(state.timesTemplateSlug).toBe("drag");
    state = addMonthReducer(state, {
      type: "setSharedTimes",
      times: { startTime: "21:00", endTime: null },
    });
    state = addMonthReducer(state, {
      type: "applyTemplateTimes",
      template: { ...template, slug: "drag" },
    });
    expect(state.times).toEqual({ startTime: "21:00", endTime: null });
  });
});

describe("addMonthReducer photos and row times", () => {
  it("an empty photo key returns the row to the shared cover", () => {
    let state = withDates("2026-11-07");
    state = addMonthReducer(state, {
      type: "setRowPhotoKey",
      date: "2026-11-07",
      key: "uploads/a.jpg",
    });
    expect(firstRow(state).photo).toEqual({
      key: "uploads/a.jpg",
      previewUrl: null,
    });
    state = addMonthReducer(state, {
      type: "setRowPhotoKey",
      date: "2026-11-07",
      key: "",
    });
    expect(firstRow(state).photo).toBeNull();
  });

  it("stores a preview for the row photo's current key", () => {
    let state = withDates("2026-11-07");
    state = addMonthReducer(state, {
      type: "setRowPhotoKey",
      date: "2026-11-07",
      key: "k1",
    });
    state = addMonthReducer(state, {
      type: "setRowPhotoPreview",
      date: "2026-11-07",
      key: "k1",
      previewUrl: "blob:1",
    });
    expect(firstRow(state).photo).toEqual({ key: "k1", previewUrl: "blob:1" });
    state = addMonthReducer(state, {
      type: "setRowPhotoKey",
      date: "2026-11-07",
      key: "k1",
    });
    expect(firstRow(state).photo).toEqual({ key: "k1", previewUrl: "blob:1" });
  });

  it("a preview for a key that changed in the meantime is dropped", () => {
    let state = withDates("2026-11-07");
    state = addMonthReducer(state, {
      type: "setRowPhotoKey",
      date: "2026-11-07",
      key: "k1",
    });
    state = addMonthReducer(state, {
      type: "setRowPhotoKey",
      date: "2026-11-07",
      key: "k2",
    });
    state = addMonthReducer(state, {
      type: "setRowPhotoPreview",
      date: "2026-11-07",
      key: "k1",
      previewUrl: "blob:1",
    });
    expect(firstRow(state).photo).toEqual({ key: "k2", previewUrl: null });
  });

  it("a preview without a photo leaves the row on the shared cover", () => {
    const state = addMonthReducer(withDates("2026-11-07"), {
      type: "setRowPhotoPreview",
      date: "2026-11-07",
      key: "k1",
      previewUrl: "blob:1",
    });
    expect(firstRow(state).photo).toBeNull();
  });

  it("a shared cover preview for a replaced key is dropped", () => {
    let state = addMonthReducer(EMPTY_ADD_MONTH_STATE, {
      type: "setSharedCoverKey",
      key: "k1",
    });
    state = addMonthReducer(state, { type: "setSharedCoverKey", key: "k2" });
    state = addMonthReducer(state, {
      type: "setSharedCoverPreview",
      key: "k1",
      previewUrl: "blob:1",
    });
    expect(state.sharedCover).toEqual({ key: "k2", previewUrl: null });
    state = addMonthReducer(state, {
      type: "setSharedCoverPreview",
      key: "k2",
      previewUrl: "blob:2",
    });
    expect(state.sharedCover).toEqual({ key: "k2", previewUrl: "blob:2" });
    state = addMonthReducer(state, { type: "setSharedCoverKey", key: "" });
    expect(state.sharedCover).toBeNull();
  });

  it("sets and clears a row's own times", () => {
    let state = addMonthReducer(withDates("2026-11-07"), {
      type: "setRowTime",
      date: "2026-11-07",
      timeOverride: { startTime: "20:00", endTime: "23:00" },
    });
    expect(firstRow(state).timeOverride).toEqual({
      startTime: "20:00",
      endTime: "23:00",
    });
    state = addMonthReducer(state, {
      type: "setRowTime",
      date: "2026-11-07",
      timeOverride: null,
    });
    expect(firstRow(state).timeOverride).toBeNull();
  });

  it("an edit to a date without a row changes nothing", () => {
    const state = withDates("2026-11-07");
    expect(
      addMonthReducer(state, {
        type: "editRow",
        date: "2026-11-08",
        patch: { title: "Lost" },
      }),
    ).toBe(state);
  });
});

describe("addMonthReducer shared edits, pledges and restore", () => {
  it("patchPlace does nothing until editing has started", () => {
    expect(
      addMonthReducer(EMPTY_ADD_MONTH_STATE, {
        type: "patchPlace",
        patch: { venue: "X" },
      }).place,
    ).toBeNull();
  });

  it("patchCost does nothing until editing has started", () => {
    expect(
      addMonthReducer(EMPTY_ADD_MONTH_STATE, {
        type: "patchCost",
        patch: { cost: "5" },
      }).cost,
    ).toBeNull();
  });

  it("patches the place and cost once editing has started, and resetShared drops both", () => {
    let state = addMonthReducer(EMPTY_ADD_MONTH_STATE, {
      type: "startEditingShared",
      place: placeValuesFromTemplate(template),
      cost: costValuesFromTemplate(template),
    });
    state = addMonthReducer(state, {
      type: "patchPlace",
      patch: { venue: "Rooftop" },
    });
    state = addMonthReducer(state, {
      type: "patchCost",
      patch: { costKind: "fixed", cost: "8" },
    });
    expect(state.place).toMatchObject({ venue: "Rooftop", hood: "Arroios" });
    expect(state.cost).toMatchObject({ costKind: "fixed", cost: "8" });
    state = addMonthReducer(state, { type: "resetShared" });
    expect(state).toMatchObject({ place: null, cost: null });
  });

  it("toggles each pledge on its own", () => {
    let state = addMonthReducer(EMPTY_ADD_MONTH_STATE, {
      type: "togglePledge",
      index: 1,
    });
    expect(state.pledges).toEqual([false, true]);
    state = addMonthReducer(state, { type: "togglePledge", index: 0 });
    state = addMonthReducer(state, { type: "togglePledge", index: 1 });
    expect(state.pledges).toEqual([true, false]);
  });

  it("restore replaces the whole state and reset empties it", () => {
    const saved: AddMonthState = {
      ...withDates("2026-11-07", "2026-11-14"),
      templateSlug: "drag",
      timesTemplateSlug: "drag",
      times: { startTime: "22:00", endTime: "03:00" },
      pledges: [true, true],
    };
    const restored = addMonthReducer(withDates("2026-12-01"), {
      type: "restore",
      state: saved,
    });
    expect(restored).toEqual(saved);
    expect(addMonthReducer(restored, { type: "reset" })).toEqual(
      EMPTY_ADD_MONTH_STATE,
    );
  });
});

describe("placeValuesFromTemplate", () => {
  it("reads an in-person template's place", () => {
    expect(placeValuesFromTemplate(template)).toEqual({
      hood: "Arroios",
      venue: "Casa Comum",
      venueListingId: "listing-1",
      venueListing: { slug: "casa-comum", name: "Casa Comum" },
      address: "Rua de Arroios 12",
      directions: "Ring the second bell",
      onlineUrl: "",
    });
  });

  it("placeValuesFromTemplate reads an online template as the Online hood with its link", () => {
    expect(
      placeValuesFromTemplate({
        ...template,
        isOnline: true,
        onlineUrl: "https://meet.example/x",
      }),
    ).toMatchObject({
      hood: ONLINE_HOOD_VALUE,
      venue: "",
      venueListingId: null,
      venueListing: null,
      address: "",
      directions: "",
      onlineUrl: "https://meet.example/x",
    });
  });

  it("reads missing place fields as empty text", () => {
    expect(
      placeValuesFromTemplate({
        ...template,
        neighbourhood: null,
        venue: null,
        address: null,
        arrivalNotes: null,
        listingId: null,
        venueListing: null,
      }),
    ).toEqual({
      hood: "",
      venue: "",
      venueListingId: null,
      venueListing: null,
      address: "",
      directions: "",
      onlineUrl: "",
    });
  });
});

describe("costValuesFromTemplate", () => {
  it("reads a template without a cost as free with empty fields", () => {
    expect(costValuesFromTemplate(template)).toEqual({
      costKind: "free",
      cost: "",
      paymentUrl: "",
      paymentInstructions: "",
    });
  });

  it("reads a legacy template with a written cost and no kind as fixed and keeps the price", () => {
    const legacy = { ...template, costKind: null, cost: "10 EUR" };
    expect(costKindOfTemplate(legacy)).toBe("fixed");
    expect(costValuesFromTemplate(legacy)).toMatchObject({
      costKind: "fixed",
      cost: "10 EUR",
    });
  });

  it("reads a template with a blank cost and no kind as free", () => {
    expect(
      costKindOfTemplate({ ...template, costKind: null, cost: "   " }),
    ).toBe("free");
  });

  it("keeps a template's cost and payment details", () => {
    expect(
      costValuesFromTemplate({
        ...template,
        costKind: "pay-what-you-can",
        cost: "5-10",
        paymentUrl: "https://pay.example/x",
        paymentInstructions: "Pay at the door",
      }),
    ).toEqual({
      costKind: "pay-what-you-can",
      cost: "5-10",
      paymentUrl: "https://pay.example/x",
      paymentInstructions: "Pay at the door",
    });
  });
});

describe("isRowStarted", () => {
  const row = {
    date: "2026-11-07",
    title: "",
    description: "",
    photo: null,
    timeOverride: null,
  };

  it("reads an untouched row as empty", () => {
    expect(isRowStarted(row)).toBe(false);
    expect(isRowStarted({ ...row, title: "   " })).toBe(false);
  });

  it("reads a title, a description, a photo or own times as started", () => {
    expect(isRowStarted({ ...row, title: "Drag night" })).toBe(true);
    expect(isRowStarted({ ...row, description: "Half" })).toBe(true);
    expect(
      isRowStarted({ ...row, photo: { key: "k1", previewUrl: null } }),
    ).toBe(true);
    expect(
      isRowStarted({
        ...row,
        timeOverride: { startTime: "20:00", endTime: null },
      }),
    ).toBe(true);
  });
});
