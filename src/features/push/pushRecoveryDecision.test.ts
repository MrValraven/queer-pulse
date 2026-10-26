import { describe, expect, it } from "vitest";
import {
  PUSH_RECOVERY_REPROMPT_MS,
  decidePushRecoveryPrompt,
  type PushRecoveryInput,
} from "./pushResyncDecision";

const NOW = 1_800_000_000_000;
const MEMBER_ID = "member-a";

function decide(overrides: Partial<PushRecoveryInput>) {
  return decidePushRecoveryPrompt({
    memberId: MEMBER_ID,
    hasPushApis: true,
    pushEnabledMemberIds: [MEMBER_ID],
    outcome: "permissionNotGranted",
    permission: "default",
    lastDismissedAt: null,
    now: NOW,
    ...overrides,
  });
}

describe("decidePushRecoveryPrompt", () => {
  it("names the reset permission when the browser went back to asking", () => {
    expect(decide({})).toBe("permissionDefault");
  });

  it("names the blocked permission when the browser denies notifications", () => {
    expect(decide({ permission: "denied" })).toBe("permissionDenied");
  });

  it("prompts after a failed silent restore with permission still granted", () => {
    expect(decide({ outcome: "subscribeFailed", permission: "granted" })).toBe(
      "subscribeFailed",
    );
    expect(decide({ outcome: "noSubscription", permission: "granted" })).toBe(
      "subscribeFailed",
    );
  });

  it("stays quiet when push works or the pass was inconclusive", () => {
    expect(decide({ outcome: "working", permission: "granted" })).toBeNull();
    expect(
      decide({ outcome: "inconclusive", permission: "granted" }),
    ).toBeNull();
    expect(decide({ outcome: null })).toBeNull();
  });

  it("stays quiet for a signed-out member, an unsupported browser, or demo", () => {
    expect(decide({ memberId: null })).toBeNull();
    expect(decide({ hasPushApis: false })).toBeNull();
  });

  it("never prompts a member who did not turn push on on this device", () => {
    expect(decide({ pushEnabledMemberIds: ["member-b"] })).toBeNull();
    expect(decide({ pushEnabledMemberIds: [] })).toBeNull();
  });

  it("hides after a dismissal and returns once the window passes", () => {
    expect(decide({ lastDismissedAt: NOW - 1_000 })).toBeNull();
    expect(
      decide({ lastDismissedAt: NOW - PUSH_RECOVERY_REPROMPT_MS + 1 }),
    ).toBeNull();
    expect(decide({ lastDismissedAt: NOW - PUSH_RECOVERY_REPROMPT_MS })).toBe(
      "permissionDefault",
    );
  });

  it("treats a dismissal in the future as expired", () => {
    expect(decide({ lastDismissedAt: NOW + 1_000 })).toBe("permissionDefault");
  });
});
