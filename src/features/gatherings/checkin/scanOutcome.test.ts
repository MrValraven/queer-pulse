import { describe, expect, it } from "vitest";
import {
  classifyCardScan,
  createScanGate,
  isRepeatArrival,
  recordedStampAfterScan,
} from "./scanOutcome";

describe("isRepeatArrival", () => {
  const requestStartedAt = new Date("2026-10-10T21:00:30Z");

  it("treats a stamp from this request as a fresh arrival", () => {
    expect(
      isRepeatArrival(new Date("2026-10-10T21:00:31Z"), requestStartedAt),
    ).toBe(false);
  });

  it("treats a stamp more than ten seconds older as a repeat", () => {
    expect(
      isRepeatArrival(new Date("2026-10-10T21:00:19Z"), requestStartedAt),
    ).toBe(true);
  });

  it("is never a repeat without a stamp", () => {
    expect(isRepeatArrival(null, requestStartedAt)).toBe(false);
  });
});

describe("classifyCardScan", () => {
  const requestStartedAt = new Date("2026-10-10T21:00:30Z");
  const welcomedStamp = new Date("2026-10-10T21:00:26Z");

  it("welcomes a fresh check-in this tab has not welcomed", () => {
    expect(
      classifyCardScan(
        new Date("2026-10-10T21:00:31Z"),
        requestStartedAt,
        undefined,
      ),
    ).toBe("welcome");
  });

  it("calls a held card's re-read with the welcomed stamp a repeat", () => {
    expect(
      classifyCardScan(
        new Date(welcomedStamp.getTime()),
        requestStartedAt,
        welcomedStamp.getTime(),
      ),
    ).toBe("repeat");
  });

  it("welcomes again when another device undid the check-in and this read made a new one", () => {
    expect(
      classifyCardScan(
        new Date("2026-10-10T21:00:31Z"),
        requestStartedAt,
        welcomedStamp.getTime(),
      ),
    ).toBe("welcome");
  });

  it("calls a scan a repeat when it matches a check-in this tab made by name", () => {
    const nameCheckInStamp = new Date("2026-10-10T21:00:28Z");
    expect(
      classifyCardScan(
        new Date(nameCheckInStamp.getTime()),
        requestStartedAt,
        nameCheckInStamp.getTime(),
      ),
    ).toBe("repeat");
  });

  it("calls an old stamp a repeat whatever this tab remembers", () => {
    const oldStamp = new Date("2026-10-10T20:45:00Z");
    expect(classifyCardScan(oldStamp, requestStartedAt, undefined)).toBe(
      "repeat",
    );
    expect(
      classifyCardScan(oldStamp, requestStartedAt, welcomedStamp.getTime()),
    ).toBe("repeat");
  });

  it("keeps the held-card guard when either stamp is missing", () => {
    expect(
      classifyCardScan(null, requestStartedAt, welcomedStamp.getTime()),
    ).toBe("repeat");
    expect(
      classifyCardScan(
        new Date("2026-10-10T21:00:31Z"),
        requestStartedAt,
        null,
      ),
    ).toBe("repeat");
  });

  it("welcomes a stampless read this tab has not welcomed", () => {
    expect(classifyCardScan(undefined, requestStartedAt, undefined)).toBe(
      "welcome",
    );
  });
});

describe("recordedStampAfterScan", () => {
  const returnedStamp = new Date("2026-10-10T21:00:31Z");
  const recordedStampMs = new Date("2026-10-10T21:00:26Z").getTime();

  it("records the stamp a welcome came back with, overwriting the old one", () => {
    expect(
      recordedStampAfterScan("welcome", returnedStamp, recordedStampMs),
    ).toBe(returnedStamp.getTime());
  });

  it("records null for a welcome that came back without a stamp", () => {
    expect(recordedStampAfterScan("welcome", null, undefined)).toBeNull();
  });

  it("leaves a repeat for an unrecorded guest unrecorded", () => {
    expect(
      recordedStampAfterScan("repeat", returnedStamp, undefined),
    ).toBeUndefined();
  });

  it("fills a stampless record from the stamp a repeat came back with", () => {
    expect(recordedStampAfterScan("repeat", returnedStamp, null)).toBe(
      returnedStamp.getTime(),
    );
  });

  it("keeps the recorded stamp when a repeat came back without one", () => {
    expect(recordedStampAfterScan("repeat", null, recordedStampMs)).toBe(
      recordedStampMs,
    );
  });
});

describe("createScanGate", () => {
  it("accepts a card once, ignores it during the cooldown, then accepts again", () => {
    const gate = createScanGate(4_000);
    expect(gate.shouldAccept("card-a", 0)).toBe(true);
    expect(gate.shouldAccept("card-a", 1_000)).toBe(false);
    expect(gate.shouldAccept("card-a", 3_999)).toBe(false);
    expect(gate.shouldAccept("card-a", 4_000)).toBe(true);
  });

  it("accepts a different card straight away", () => {
    const gate = createScanGate(4_000);
    gate.shouldAccept("card-a", 0);
    expect(gate.shouldAccept("card-b", 100)).toBe(true);
  });
});
