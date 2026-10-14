import { describe, expect, it } from "vitest";
import {
  DEMO_PREVIEW_TOKEN,
  DEMO_PUBLISHED_PREVIEW_TOKEN,
  DEMO_VISITOR_PREVIEW_TOKEN,
  demoIsReminderSet,
  demoPreviewLinkFor,
  demoReleaseIdForToken,
  demoRevokePreviewLink,
  demoSetReminder,
  demoStorePreviewLink,
} from "./studioDemoArtistTools";

describe("demo artist tools store", () => {
  it("remembers a reminder and forgets it again", () => {
    expect(demoIsReminderSet("r-reminder")).toBe(false);
    demoSetReminder("r-reminder", true);
    expect(demoIsReminderSet("r-reminder")).toBe(true);
    demoSetReminder("r-reminder", false);
    expect(demoIsReminderSet("r-reminder")).toBe(false);
  });

  it("keeps one release's reminder apart from another's", () => {
    demoSetReminder("r-first", true);
    expect(demoIsReminderSet("r-second")).toBe(false);
    demoSetReminder("r-first", false);
  });

  it("seeds the draft's link, a published release's link and a visitor's link", () => {
    for (const token of [
      DEMO_PREVIEW_TOKEN,
      DEMO_PUBLISHED_PREVIEW_TOKEN,
      DEMO_VISITOR_PREVIEW_TOKEN,
    ])
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(demoReleaseIdForToken(DEMO_VISITOR_PREVIEW_TOKEN)).toBe(
      "demo-release-scheduled-night-bus",
    );
    expect(demoReleaseIdForToken(DEMO_PREVIEW_TOKEN)).toBe(
      "demo-release-draft-cartas-ao-mar",
    );
    expect(demoReleaseIdForToken(DEMO_PUBLISHED_PREVIEW_TOKEN)).toBe(
      "demo-release-cidade-dos-santos",
    );
    expect(demoPreviewLinkFor("demo-release-draft-cartas-ao-mar")?.token).toBe(
      DEMO_PREVIEW_TOKEN,
    );
  });

  it("answers null for a token no release holds", () => {
    expect(demoReleaseIdForToken("0".repeat(64))).toBeNull();
  });

  it("replaces a release's link so the old token stops working", () => {
    const first = "1".repeat(64);
    const second = "2".repeat(64);
    demoStorePreviewLink("r-link", {
      token: first,
      createdAt: "2026-10-01T00:00:00.000Z",
    });
    expect(demoReleaseIdForToken(first)).toBe("r-link");
    demoStorePreviewLink("r-link", {
      token: second,
      createdAt: "2026-10-02T00:00:00.000Z",
    });
    expect(demoReleaseIdForToken(first)).toBeNull();
    expect(demoPreviewLinkFor("r-link")?.token).toBe(second);
    demoRevokePreviewLink("r-link");
    expect(demoReleaseIdForToken(second)).toBeNull();
    expect(demoPreviewLinkFor("r-link")).toBeNull();
  });
});
