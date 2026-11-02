import { afterEach, describe, expect, it, vi } from "vitest";
import type { CreateEventBatchDto } from "../api/eventBatch.api";
import { gatheringDetails } from "../data";
import {
  createDemoEventBatch,
  demoBatchHostingEvents,
  demoEventBatchTemplate,
  demoEventBatchTemplateOptions,
  resetDemoEventBatch,
} from "./eventBatchDemo";

const now = new Date("2026-11-02T10:00:00Z");

/** A batch from the mixer with one row per date, titled after its date. */
function dto(dates: string[]): CreateEventBatchDto {
  return {
    templateSlug: "newcomers-mixer-july",
    shared: { startTime: "18:30", endTime: "21:00" },
    rows: dates.map((date) => ({
      date,
      title: `Row ${date}`,
      description: `Description for ${date}`,
    })),
  };
}

const originalCreateObjectURL = Object.getOwnPropertyDescriptor(
  URL,
  "createObjectURL",
);

afterEach(() => {
  resetDemoEventBatch();
  vi.unstubAllGlobals();
  // jsdom has no `createObjectURL`, so the stub is removed when none was there.
  if (originalCreateObjectURL) {
    Object.defineProperty(URL, "createObjectURL", originalCreateObjectURL);
  } else {
    Reflect.deleteProperty(URL, "createObjectURL");
  }
});

/** Stubs the read of a picked photo's blob and the copy the stand-in makes. */
function stubBlobCopy() {
  const picked = new Blob(["photo"], { type: "image/jpeg" });
  const fetchBlob = vi.fn(() =>
    Promise.resolve({ blob: () => Promise.resolve(picked) }),
  );
  vi.stubGlobal("fetch", fetchBlob);
  let copyCount = 0;
  const createObjectURL = vi.fn<(object: Blob) => string>(() => {
    copyCount += 1;
    return `blob:http://localhost/batch-copy-${copyCount}`;
  });
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: createObjectURL,
  });
  return { fetchBlob, createObjectURL };
}

describe("demoEventBatchTemplateOptions", () => {
  it("offers the demo member's hosted events, newest first, as templates", () => {
    const options = demoEventBatchTemplateOptions();
    expect(options.map((option) => option.slug)).toEqual(
      expect.arrayContaining([
        "newcomers-mixer-july",
        "trans-joy-picnic",
        "poly-open-discussion",
      ]),
    );
    const starts = options.map((option) => option.startAt);
    expect(starts).toEqual([...starts].sort().reverse());
  });

  it("offers a created event as a starting event too", async () => {
    const created = await createDemoEventBatch(dto(["2026-11-07"]), now);
    expect(
      demoEventBatchTemplateOptions().map((option) => option.slug),
    ).toContain(created.events[0]!.slug);
  });
});

describe("demoEventBatchTemplate", () => {
  it("builds a template view with Lisbon time and the template's own description", () => {
    const view = demoEventBatchTemplate("newcomers-mixer-july");
    expect(view).toMatchObject({
      slug: "newcomers-mixer-july",
      timezone: "Europe/Lisbon",
    });
    expect(view.description).toBe(
      gatheringDetails["newcomers-mixer-july"]!.body,
    );
  });

  it("shows a dropped community notice on the co-hosted template", () => {
    expect(
      demoEventBatchTemplate("poly-open-discussion").communityDropped,
    ).toEqual({ name: "Sober Queers", reason: "notModerator" });
  });

  it("keeps every payment field empty", () => {
    for (const option of demoEventBatchTemplateOptions()) {
      const view = demoEventBatchTemplate(option.slug);
      expect(view.paymentUrl).toBeNull();
      expect(view.paymentInstructions).toBeNull();
      expect(view.cost).toBeNull();
    }
  });

  it("answers an unknown slug with the coded not-found error", () => {
    expect(() => demoEventBatchTemplate("nope")).toThrow(
      expect.objectContaining({
        status: 404,
        data: expect.objectContaining({
          code: "EVENT_BATCH_TEMPLATE_NOT_FOUND",
        }),
      }),
    );
  });

  it("answers a demo event the member does not host with the same 404", () => {
    expect(() => demoEventBatchTemplate("supper-club-12")).toThrow(
      expect.objectContaining({ status: 404 }),
    );
  });
});

describe("createDemoEventBatch", () => {
  it("creates one event per row in date order and opens each on its own detail", async () => {
    const created = await createDemoEventBatch(
      dto(["2026-11-21", "2026-11-07"]),
      now,
    );
    expect(created.events.map((event) => event.title)).toEqual([
      "Row 2026-11-07",
      "Row 2026-11-21",
    ]);
    expect(gatheringDetails[created.events[0]!.slug]!.title).toBe(
      "Row 2026-11-07",
    );
  });

  it("answers each start as the Lisbon instant of the row's date and time", async () => {
    const created = await createDemoEventBatch(dto(["2026-11-07"]), now);
    expect(created.events[0]!.startAt).toBe("2026-11-07T18:30:00.000Z");
  });

  it("reads a summer date on Lisbon summer time", async () => {
    const created = await createDemoEventBatch(dto(["2027-07-07"]), now);
    expect(created.events[0]!.startAt).toBe("2027-07-07T17:30:00.000Z");
  });

  it("reads a created event back with the place and cost it was published with", async () => {
    const batch = dto(["2026-11-07"]);
    batch.shared = {
      ...batch.shared,
      venue: "Casa do Bairro",
      neighbourhood: "Graça",
      costKind: "pay-what-you-can",
      cost: "5 to 10 EUR",
    };
    const created = await createDemoEventBatch(batch, now);
    expect(demoEventBatchTemplate(created.events[0]!.slug)).toMatchObject({
      venue: "Casa do Bairro",
      neighbourhood: "Graça",
      costKind: "pay-what-you-can",
      cost: "5 to 10 EUR",
      isOnline: false,
      startTime: "18:30",
      endTime: "21:00",
    });
  });

  it("appends the new events to the demo hosting list", async () => {
    await createDemoEventBatch(dto(["2026-11-07"]), now);
    expect(demoBatchHostingEvents()).toEqual([
      expect.objectContaining({
        category: "hosting",
        date: "2026-11-07",
        title: "Row 2026-11-07",
      }),
    ]);
  });

  it("gives a second month on the same date its own slug", async () => {
    const first = await createDemoEventBatch(dto(["2026-11-07"]), now);
    const second = await createDemoEventBatch(dto(["2026-11-07"]), now);
    expect(second.events[0]!.slug).not.toBe(first.events[0]!.slug);
    expect(second.events[0]!.slug).toBe(`${first.events[0]!.slug}-2`);
  });

  it("copies each picked blob cover once so the events keep their photos", async () => {
    const { fetchBlob, createObjectURL } = stubBlobCopy();
    const sharedBlob = "blob:http://localhost/shared-cover";
    const rowBlob = "blob:http://localhost/row-cover";
    const batch = dto(["2026-11-07", "2026-11-14", "2026-11-21"]);
    batch.shared = { ...batch.shared, coverImageUrl: sharedBlob };
    batch.rows[1]!.coverImageUrl = rowBlob;
    batch.rows[2]!.coverImageUrl = "uploads/event-cover/stored.jpg";
    const created = await createDemoEventBatch(batch, now);
    expect(fetchBlob).toHaveBeenCalledTimes(2);
    expect(createObjectURL).toHaveBeenCalledTimes(2);
    const covers = created.events.map(
      (event) => gatheringDetails[event.slug]!.coverImageUrl,
    );
    expect(covers).not.toContain(sharedBlob);
    expect(covers).not.toContain(rowBlob);
    expect(covers[0]).toMatch(/^blob:http:\/\/localhost\/batch-copy-/);
    expect(covers[1]).toMatch(/^blob:http:\/\/localhost\/batch-copy-/);
    expect(covers[1]).not.toBe(covers[0]);
    expect(covers[2]).toBe("uploads/event-cover/stored.jpg");
  });

  it("keeps a blob cover it can no longer read", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))),
    );
    const revokedBlob = "blob:http://localhost/revoked-cover";
    const batch = dto(["2026-11-07"]);
    batch.shared = { ...batch.shared, coverImageUrl: revokedBlob };
    const created = await createDemoEventBatch(batch, now);
    expect(gatheringDetails[created.events[0]!.slug]!.coverImageUrl).toBe(
      revokedBlob,
    );
  });

  it("forgets every created detail on reset", async () => {
    const created = await createDemoEventBatch(dto(["2026-11-07"]), now);
    resetDemoEventBatch();
    expect(gatheringDetails[created.events[0]!.slug]).toBeUndefined();
    expect(demoBatchHostingEvents()).toEqual([]);
  });

  it.each([
    [
      Array.from(
        { length: 32 },
        (_, index) => `2026-12-${String((index % 31) + 1).padStart(2, "0")}`,
      ),
      "EVENT_BATCH_TOO_MANY_DATES",
    ],
    [["2026-11-07", "2026-11-07"], "EVENT_BATCH_DUPLICATE_DATE"],
    [["2026-11-01"], "EVENT_BATCH_DATE_IN_PAST"],
    [["2027-11-03"], "EVENT_BATCH_DATE_TOO_FAR"],
  ])("refuses %j with %s and creates nothing", async (dates, code) => {
    await expect(createDemoEventBatch(dto(dates), now)).rejects.toThrow(
      expect.objectContaining({ data: expect.objectContaining({ code }) }),
    );
    expect(demoBatchHostingEvents()).toEqual([]);
  });

  it("names the row, its field and the last date on a date too far ahead", async () => {
    await expect(
      createDemoEventBatch(dto(["2026-11-07", "2027-11-03"]), now),
    ).rejects.toThrow(
      expect.objectContaining({
        status: 400,
        data: {
          statusCode: 400,
          code: "EVENT_BATCH_DATE_TOO_FAR",
          message:
            "2027-11-03 is more than 12 months away. The last date you can add is 2027-11-02.",
          rowIndex: 1,
          field: "date",
          date: "2027-11-03",
          lastDate: "2027-11-02",
        },
      }),
    );
  });

  it("checks a repeated date before a start in the past on the same row", async () => {
    const batch = dto(["2026-11-02", "2026-11-02"]);
    batch.rows[0]!.startTime = "23:00";
    batch.rows[1]!.startTime = "09:00";
    await expect(createDemoEventBatch(batch, now)).rejects.toThrow(
      expect.objectContaining({
        data: expect.objectContaining({
          code: "EVENT_BATCH_DUPLICATE_DATE",
          rowIndex: 1,
          field: "date",
        }),
      }),
    );
  });

  it("answers the first failing row in request order", async () => {
    await expect(
      createDemoEventBatch(
        dto(["2026-11-07", "2026-11-01", "2026-11-14", "2026-11-07"]),
        now,
      ),
    ).rejects.toThrow(
      expect.objectContaining({
        data: expect.objectContaining({
          code: "EVENT_BATCH_DATE_IN_PAST",
          rowIndex: 1,
          field: "startTime",
        }),
      }),
    );
  });

  it("refuses a starting event the member does not host before any row", async () => {
    await expect(
      createDemoEventBatch(
        { ...dto(["2026-11-01"]), templateSlug: "supper-club-12" },
        now,
      ),
    ).rejects.toThrow(expect.objectContaining({ status: 404 }));
    expect(demoBatchHostingEvents()).toEqual([]);
  });
});
