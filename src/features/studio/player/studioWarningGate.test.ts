import { afterEach, describe, expect, it } from "vitest";
import {
  clearStudioWarningConsent,
  consentToWarnedTrack,
  hasWarningConsent,
  isWarningGated,
  warningGateOf,
} from "./studioWarningGate";
import type { StudioQueueItem } from "./studioPlayerContext";

const warned = {
  trackId: "w1",
  contentWarnings: ["self-harm"],
} as StudioQueueItem;
const plain = {
  trackId: "p1",
  contentWarnings: [],
} as unknown as StudioQueueItem;

afterEach(() => clearStudioWarningConsent());

describe("the warning gate", () => {
  it("asks about a warned track nobody agreed to", () => {
    expect(isWarningGated(warned, warningGateOf({}))).toBe(true);
    expect(isWarningGated(plain, warningGateOf({}))).toBe(false);
  });

  it("lets a consented track through, and every track with the setting off", () => {
    consentToWarnedTrack("w1");
    expect(isWarningGated(warned, warningGateOf({}))).toBe(false);
    clearStudioWarningConsent();
    expect(
      isWarningGated(warned, warningGateOf({ askBeforeWarnings: false })),
    ).toBe(false);
  });

  it("snapshots the consent set, so a gate built earlier does not change", () => {
    const gate = warningGateOf({ askBeforeWarnings: true });
    consentToWarnedTrack("w1");
    expect(isWarningGated(warned, gate)).toBe(true);
  });

  it("forgets every consent on clear", () => {
    consentToWarnedTrack("w1");
    clearStudioWarningConsent();
    expect(hasWarningConsent("w1")).toBe(false);
  });

  it("never gates a move that carries no gate", () => {
    expect(isWarningGated(warned, undefined)).toBe(false);
  });
});
