import { describe, expect, it } from "vitest";
import { ONLINE_HOOD_VALUE } from "../steps/dateNotes.data";
import {
  addMonthStateToDto,
  costOverrides,
  eventBatchBodyBytes,
  placeOverrides,
} from "./addMonthPayload";
import {
  EMPTY_ADD_MONTH_STATE,
  type AddMonthPlaceValues,
  type AddMonthRow,
  type AddMonthState,
} from "./addMonthState";

const row = (
  date: string,
  title: string,
  description: string,
): AddMonthRow => ({
  date,
  title,
  description,
  photo: null,
  timeOverride: null,
});

const state: AddMonthState = {
  ...EMPTY_ADD_MONTH_STATE,
  templateSlug: "drag-night",
  timesTemplateSlug: "drag-night",
  times: { startTime: "22:00", endTime: "03:00" },
  rows: [
    row("2026-11-07", "Drag night", "Lip sync"),
    row("2026-11-21", "Bingo", "Prizes"),
  ],
  pledges: [true, true],
};

const place: AddMonthPlaceValues = {
  hood: "Arroios",
  venue: "Casa Comum",
  venueListingId: "listing-1",
  venueListing: { slug: "casa-comum", name: "Casa Comum" },
  address: " Rua de Arroios 12 ",
  directions: " Ring the second bell ",
  onlineUrl: "",
};

/** A four-byte character, built from its code point so the source holds no glyph. */
const RAINBOW = String.fromCodePoint(0x1f308);

const stateWithDescription = (description: string): AddMonthState => ({
  ...state,
  rows: [row("2026-11-07", "Cinema", description)],
});

describe("addMonthStateToDto", () => {
  it("sends the shared times, rows in date order and no shared cover when the template's is kept", () => {
    const reversed = { ...state, rows: [...state.rows].reverse() };
    expect(addMonthStateToDto(reversed)).toEqual({
      templateSlug: "drag-night",
      shared: { startTime: "22:00", endTime: "03:00" },
      rows: [
        { date: "2026-11-07", title: "Drag night", description: "Lip sync" },
        { date: "2026-11-21", title: "Bingo", description: "Prizes" },
      ],
    });
  });

  it("a row on the shared cover sends no coverImageUrl", () => {
    const firstRow = addMonthStateToDto(state).rows[0];
    expect(firstRow).toBeDefined();
    expect("coverImageUrl" in (firstRow ?? {})).toBe(false);
  });

  it("sends a row's own photo key and a replaced shared cover key", () => {
    const withPhotos: AddMonthState = {
      ...state,
      sharedCover: { key: "uploads/shared.jpg", previewUrl: "blob:shared" },
      rows: [
        {
          ...row("2026-11-07", "Drag night", "Lip sync"),
          photo: { key: "uploads/own.jpg", previewUrl: null },
        },
      ],
    };
    const payload = addMonthStateToDto(withPhotos);
    expect(payload.shared.coverImageUrl).toBe("uploads/shared.jpg");
    expect(payload.rows[0]?.coverImageUrl).toBe("uploads/own.jpg");
  });

  it("sends a row's own times, with null for a row that ends with no end time", () => {
    const withOwnTimes: AddMonthState = {
      ...state,
      rows: [
        {
          ...row("2026-11-07", "Drag brunch", "Mimosas"),
          timeOverride: { startTime: "16:00", endTime: null },
        },
        row("2026-11-21", "Bingo", "Prizes"),
      ],
    };
    const [ownTimesRow, sharedTimesRow] = addMonthStateToDto(withOwnTimes).rows;
    expect(ownTimesRow).toMatchObject({ startTime: "16:00", endTime: null });
    expect("endTime" in (ownTimesRow ?? {})).toBe(true);
    expect("startTime" in (sharedTimesRow ?? {})).toBe(false);
    expect("endTime" in (sharedTimesRow ?? {})).toBe(false);
  });

  it("leaves the shared end out when the events have no end", () => {
    const withoutEnd = {
      ...state,
      times: { startTime: "22:00", endTime: null },
    };
    expect("endTime" in addMonthStateToDto(withoutEnd).shared).toBe(false);
  });

  it("leaves place and cost out until the host edits them", () => {
    expect(Object.keys(addMonthStateToDto(state).shared)).toEqual([
      "startTime",
      "endTime",
    ]);
  });

  it("sends the edited place and cost on the shared overrides", () => {
    const edited: AddMonthState = {
      ...state,
      place,
      cost: {
        costKind: "fixed",
        cost: "5 EUR",
        paymentUrl: "",
        paymentInstructions: "",
      },
    };
    expect(addMonthStateToDto(edited).shared).toMatchObject({
      venue: "Casa Comum",
      listingId: "listing-1",
      costKind: "fixed",
      cost: "5 EUR",
    });
  });

  it("trims titles and descriptions", () => {
    const padded = {
      ...state,
      rows: [row("2026-11-07", "  Drag night ", "\n Lip sync \n")],
    };
    expect(addMonthStateToDto(padded).rows[0]).toEqual({
      date: "2026-11-07",
      title: "Drag night",
      description: "Lip sync",
    });
  });

  it("throws for a state without a starting event", () => {
    expect(() => addMonthStateToDto(EMPTY_ADD_MONTH_STATE)).toThrow(
      /templateSlug/,
    );
  });
});

describe("placeOverrides", () => {
  it("placeOverrides clears every door field for an online place", () => {
    expect(
      placeOverrides({
        ...place,
        hood: ONLINE_HOOD_VALUE,
        onlineUrl: " https://meet.example/a ",
      }),
    ).toEqual({
      isOnline: true,
      onlineUrl: "https://meet.example/a",
      neighbourhood: null,
      venue: null,
      listingId: null,
      address: null,
      arrivalNotes: null,
    });
  });

  it("placeOverrides clears a blank join link on an online place", () => {
    const overrides = placeOverrides({
      ...place,
      hood: ONLINE_HOOD_VALUE,
      onlineUrl: "  ",
    });
    expect(overrides.onlineUrl).toBeNull();
    expect(overrides.onlineUrl).not.toBe("");
    expect(overrides.isOnline).toBe(true);
  });

  it("placeOverrides sends a door with trimmed fields and clears the join link", () => {
    expect(placeOverrides(place)).toEqual({
      isOnline: false,
      onlineUrl: null,
      neighbourhood: "Arroios",
      venue: "Casa Comum",
      listingId: "listing-1",
      address: "Rua de Arroios 12",
      arrivalNotes: "Ring the second bell",
    });
  });

  it("placeOverrides falls back to the hood for a blank venue, as the wizard does", () => {
    expect(
      placeOverrides({ ...place, venue: " ", hood: "Mouraria" }).venue,
    ).toBe("Mouraria");
  });

  it("placeOverrides sends null for blank door fields", () => {
    expect(
      placeOverrides({
        ...place,
        hood: "",
        venue: "",
        venueListingId: null,
        address: " ",
        directions: "",
      }),
    ).toMatchObject({
      neighbourhood: null,
      venue: null,
      listingId: null,
      address: null,
      arrivalNotes: null,
    });
  });
});

describe("costOverrides", () => {
  it("costOverrides clears the price and payment for a free event", () => {
    expect(
      costOverrides({
        costKind: "free",
        cost: "10",
        paymentUrl: "x.com",
        paymentInstructions: "Cash",
      }),
    ).toEqual({
      costKind: "free",
      cost: null,
      paymentUrl: null,
      paymentInstructions: null,
    });
  });

  it("costOverrides completes a bare payment domain", () => {
    expect(
      costOverrides({
        costKind: "fixed",
        cost: "10 EUR",
        paymentUrl: "pay.example/x",
        paymentInstructions: "",
      }).paymentUrl,
    ).toBe("https://pay.example/x");
  });

  it("costOverrides sends a null cost for a blank price and trims the rest", () => {
    expect(
      costOverrides({
        costKind: "pay-what-you-can",
        cost: "  ",
        paymentUrl: "",
        paymentInstructions: " MB WAY at the door ",
      }),
    ).toEqual({
      costKind: "pay-what-you-can",
      cost: null,
      paymentUrl: null,
      paymentInstructions: "MB WAY at the door",
    });
  });
});

describe("eventBatchBodyBytes", () => {
  it("eventBatchBodyBytes equals the TextEncoder bytes of JSON.stringify", () => {
    const payload = addMonthStateToDto(
      stateWithDescription(`Sessão de cinema com pipocas ${RAINBOW}`),
    );
    expect(eventBatchBodyBytes(payload)).toBe(
      new TextEncoder().encode(JSON.stringify(payload)).length,
    );
    // The accents and the emoji take more than one byte each.
    expect(eventBatchBodyBytes(payload)).toBeGreaterThan(
      JSON.stringify(payload).length,
    );
  });
});
