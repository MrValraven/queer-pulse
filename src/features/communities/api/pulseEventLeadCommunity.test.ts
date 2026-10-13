import { describe, expect, it } from "vitest";
import { createFormatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import { pulseEventToCommunityEvent } from "./communities.adapters";

const t: TFunction = (key) => key;
const fmt = createFormatters("en");
const base = {
  slug: "queer-runners-run",
  title: "End-of-Month Run",
  startAt: "2026-11-01T09:00:00",
  venue: "Tejo path",
  isOnline: false,
  goingCount: 12,
};

function leadNameOf(row: Parameters<typeof pulseEventToCommunityEvent>[0]) {
  return pulseEventToCommunityEvent(row, fmt, t, "12 going", "Online")
    .leadCommunityName;
}

describe("pulseEventToCommunityEvent lead community", () => {
  it("names the lead on a row where this community is a guest", () => {
    expect(
      leadNameOf({
        ...base,
        hostedAs: "guest",
        leadCommunity: { slug: "queer-runners", name: "Queer Runners Lisboa" },
      }),
    ).toBe("Queer Runners Lisboa");
  });

  it("names no lead on a row this community leads", () => {
    expect(
      leadNameOf({ ...base, hostedAs: "lead", leadCommunity: null }),
    ).toBeUndefined();
  });

  it("names no lead when the server withheld a private one", () => {
    expect(
      leadNameOf({ ...base, hostedAs: "guest", leadCommunity: null }),
    ).toBeUndefined();
  });

  it("reads an older server with neither field as a lead row", () => {
    expect(leadNameOf(base)).toBeUndefined();
  });
});
