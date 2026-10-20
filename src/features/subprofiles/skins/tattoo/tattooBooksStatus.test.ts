import { describe, expect, it } from "vitest";
import {
  TATTOO_STATUS_OPTIONS,
  availabilityLabelKeyFor,
  availabilityToneKeyFor,
  resolveTattooBooksStatus,
  withTattooStatus,
} from "./tattooBooksStatus";
import { TATTOO_STATUS_TO_AVAILABILITY } from "./tattooVocab.data";

describe("tattooBooksStatus", () => {
  it("reads a stored status first", () => {
    expect(
      resolveTattooBooksStatus(
        { tattoo: { status: "closed" } },
        "open_to_collabs",
      ),
    ).toBe("closed");
  });

  it("derives the status from availability when tattoo.status is absent", () => {
    expect(resolveTattooBooksStatus(undefined, "booking")).toBe("waitlist");
    expect(resolveTattooBooksStatus({ tattoo: null }, "not_available")).toBe(
      "closed",
    );
    expect(resolveTattooBooksStatus({ tattoo: {} }, "open_to_collabs")).toBe(
      "open",
    );
  });

  it("reads the therapist value wait as no status", () => {
    const therapistShaped = {
      tattoo: { status: "wait" },
    } as unknown as Parameters<typeof resolveTattooBooksStatus>[0];
    expect(resolveTattooBooksStatus(therapistShaped, null)).toBeNull();
    expect(resolveTattooBooksStatus(therapistShaped, "booking")).toBe(
      "waitlist",
    );
  });

  it("gives no status without either", () => {
    expect(resolveTattooBooksStatus(null, null)).toBeNull();
  });

  it("labels a tattoo persona in books words and every other kind as before", () => {
    expect(availabilityLabelKeyFor("tattoo_artist", "booking", null)).toBe(
      "subprofiles:tattoo.status.waitlist",
    );
    expect(availabilityLabelKeyFor("dj", "booking")).toBe(
      "subprofiles:availability.booking",
    );
    expect(
      availabilityLabelKeyFor("tattoo_artist", null, {
        tattoo: { status: "open" },
      }),
    ).toBe("subprofiles:tattoo.status.open");
    expect(availabilityLabelKeyFor("dj", null)).toBeNull();
  });

  it("tones the pill from the resolved status", () => {
    expect(
      availabilityToneKeyFor("tattoo_artist", "open_to_collabs", {
        tattoo: { status: "closed" },
      }),
    ).toBe("not_available");
  });

  it("keeps every other skin key when it writes the status", () => {
    expect(
      withTattooStatus(
        {
          coverBleed: true,
          tattoo: { status: "open", nextOpening: "2026-11-03" },
        },
        "closed",
      ),
    ).toEqual({
      coverBleed: true,
      tattoo: { status: "closed", nextOpening: "2026-11-03" },
    });
    expect(withTattooStatus(null, "open")).toEqual({
      tattoo: { status: "open" },
    });
  });

  it("pairs each status with the contract availability", () => {
    for (const entry of TATTOO_STATUS_OPTIONS) {
      expect(entry.availability).toBe(
        TATTOO_STATUS_TO_AVAILABILITY[entry.status],
      );
    }
  });
});
