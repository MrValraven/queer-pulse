import { describe, expect, it } from "vitest";
import { callStateAt, previewFundingView } from "./fundingPreview";

const NOW = Date.parse("2026-07-20T12:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;
const iso = (offsetMs: number) => new Date(NOW + offsetMs).toISOString();

describe("fundingPreview", () => {
  it("derives the call state the way the contract does", () => {
    expect(callStateAt(iso(10 * DAY_MS), iso(0), NOW)).toBe("open");
    expect(callStateAt(iso(3 * DAY_MS), iso(0), NOW)).toBe("closing");
    expect(callStateAt(iso(-DAY_MS), iso(0), NOW)).toBe("closed");
    expect(callStateAt(null, iso(-10 * DAY_MS), NOW)).toBe("open");
    expect(callStateAt(null, iso(-200 * DAY_MS), NOW)).toBe("stale");
  });

  it("builds a pending fundraiser with its host and no call fields", () => {
    const view = previewFundingView(
      "ask",
      {
        linkUrl: "https://www.gofundme.com/f/rui",
        goalAmount: 1500,
        askPurpose: "healthcare",
        beneficiary: "self",
      },
      NOW,
    );
    expect(view.linkHost).toBe("gofundme.com");
    expect(view.askState).toBe("pending");
    expect(view.callState).toBeNull();
    expect(view.funderName).toBeNull();
  });
});
