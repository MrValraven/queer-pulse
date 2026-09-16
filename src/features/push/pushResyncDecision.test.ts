import { describe, expect, it } from "vitest";
import {
  PUSH_RESYNC_MAX_AGE_MS,
  decidePushResync,
  shouldRestorePushSubscription,
} from "./pushResyncDecision";

const NOW = 1_800_000_000_000;
const ENDPOINT = "https://push.example/abc";
const MEMBER_ID = "member-a";

function freshRecord() {
  return { endpoint: ENDPOINT, userId: MEMBER_ID, syncedAt: NOW - 1_000 };
}

function decide(overrides: Partial<Parameters<typeof decidePushResync>[0]>) {
  return decidePushResync({
    endpoint: ENDPOINT,
    hasPendingSubscription: false,
    hasSyncedThisPageLoad: true,
    lastSynced: freshRecord(),
    memberId: MEMBER_ID,
    now: NOW,
    ...overrides,
  });
}

describe("decidePushResync", () => {
  it("does nothing when the same endpoint was synced for this member recently and this page load already posted", () => {
    expect(decide({})).toBeNull();
  });

  it("re-posts once per page load even when the record is fresh and matching", () => {
    expect(decide({ hasSyncedThisPageLoad: false })).toBe(
      "firstSyncThisPageLoad",
    );
  });

  it("reports the more specific reason when a page-load POST is also due", () => {
    expect(decide({ hasSyncedThisPageLoad: false, memberId: "member-b" })).toBe(
      "memberChanged",
    );
  });

  it("re-posts a subscription the service worker stashed as pending, whatever the record says", () => {
    expect(decide({ hasPendingSubscription: true })).toBe(
      "pendingSubscription",
    );
  });

  it("re-posts when there is no record at all", () => {
    expect(decide({ lastSynced: undefined })).toBe("noRecord");
  });

  it("re-posts when the live endpoint differs from the synced one", () => {
    expect(
      decide({ lastSynced: { ...freshRecord(), endpoint: "https://old" } }),
    ).toBe("endpointChanged");
  });

  it("re-posts when a different member is signed in on this device", () => {
    expect(decide({ memberId: "member-b" })).toBe("memberChanged");
  });

  it("re-posts once for a legacy endpoint-only record (unknown member and time)", () => {
    expect(
      decide({
        lastSynced: { endpoint: ENDPOINT, userId: null, syncedAt: null },
      }),
    ).toBe("memberChanged");
  });

  it("re-posts when the member is known but the time is not", () => {
    expect(decide({ lastSynced: { ...freshRecord(), syncedAt: null } })).toBe(
      "stale",
    );
  });

  it("re-posts once the last sync is seven days old", () => {
    expect(
      decide({
        lastSynced: {
          ...freshRecord(),
          syncedAt: NOW - PUSH_RESYNC_MAX_AGE_MS,
        },
      }),
    ).toBe("stale");
    expect(
      decide({
        lastSynced: {
          ...freshRecord(),
          syncedAt: NOW - PUSH_RESYNC_MAX_AGE_MS + 1,
        },
      }),
    ).toBeNull();
  });

  it("treats a sync time in the future (clock moved back) as stale", () => {
    expect(
      decide({ lastSynced: { ...freshRecord(), syncedAt: NOW + 60_000 } }),
    ).toBe("stale");
  });

  it("uses a seven day window", () => {
    expect(PUSH_RESYNC_MAX_AGE_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

function shouldRestore(
  overrides: Partial<Parameters<typeof shouldRestorePushSubscription>[0]>,
) {
  return shouldRestorePushSubscription({
    hasAttemptedRestoreThisPageLoad: false,
    hasBrowserSubscription: false,
    isPermissionGranted: true,
    memberId: MEMBER_ID,
    pushEnabledMemberIds: [MEMBER_ID],
    ...overrides,
  });
}

describe("shouldRestorePushSubscription", () => {
  it("restores for a returning member who enabled push here, with permission and no subscription", () => {
    expect(shouldRestore({})).toBe(true);
  });

  it("never restores for a member who did not enable push on this device", () => {
    expect(shouldRestore({ pushEnabledMemberIds: ["member-b"] })).toBe(false);
    expect(shouldRestore({ pushEnabledMemberIds: [] })).toBe(false);
  });

  it("does not restore without notification permission", () => {
    expect(shouldRestore({ isPermissionGranted: false })).toBe(false);
  });

  it("leaves an existing browser subscription to the resync table", () => {
    expect(shouldRestore({ hasBrowserSubscription: true })).toBe(false);
  });

  it("tries at most once per signed-in page load", () => {
    expect(shouldRestore({ hasAttemptedRestoreThisPageLoad: true })).toBe(
      false,
    );
  });
});
