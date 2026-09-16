import { beforeEach, describe, expect, it, vi } from "vitest";
import { urlBase64ToUint8Array } from "./urlBase64ToUint8Array";

// `pushSupport` reads VITE_VAPID_PUBLIC_KEY at module-eval time, so the module
// under test is (re)imported per test AFTER the env is stubbed, mirroring
// usePushSubscription.test.ts.
async function loadSync() {
  return (await import("./usePushSubscriptionSync")).syncPushSubscriptionHealth;
}

const VAPID_KEY = "dGVzdGtleQ";
const NOW = 1_800_000_000_000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MEMBER_ID = "member-a";

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => ({
    loggedIn: true,
    checking: false,
    status: "active",
    user: { id: MEMBER_ID },
  }),
}));

const subscribePush = vi.fn((..._args: unknown[]) =>
  Promise.resolve({ ok: true }),
);
vi.mock("./push.api", () => ({
  subscribePush: (...args: unknown[]) => subscribePush(...args),
}));

const readPendingSubscription = vi.fn((): Promise<unknown> =>
  Promise.resolve(undefined),
);
const readLastSyncedSubscription = vi.fn((): Promise<unknown> =>
  Promise.resolve(undefined),
);
const writeLastSyncedSubscription = vi.fn((..._args: unknown[]) =>
  Promise.resolve(),
);
const clearPendingSubscription = vi.fn(() => Promise.resolve());
const readPushEnabledMemberIds = vi.fn((): Promise<string[]> =>
  Promise.resolve([]),
);
const addPushEnabledMemberId = vi.fn((..._args: unknown[]) =>
  Promise.resolve(),
);
vi.mock("../../pushSubStore", () => ({
  readPendingSubscription: () => readPendingSubscription(),
  readLastSyncedSubscription: () => readLastSyncedSubscription(),
  writeLastSyncedSubscription: (...args: unknown[]) =>
    writeLastSyncedSubscription(...args),
  clearPendingSubscription: () => clearPendingSubscription(),
  readPushEnabledMemberIds: () => readPushEnabledMemberIds(),
  addPushEnabledMemberId: (...args: unknown[]) =>
    addPushEnabledMemberId(...args),
}));

function makeSubscription(
  endpoint: string,
  applicationServerKey: ArrayBuffer | null,
) {
  return {
    endpoint,
    options: applicationServerKey ? { applicationServerKey } : {},
    toJSON: () => ({ endpoint, keys: { p256dh: "key", auth: "auth" } }),
    unsubscribe: vi.fn().mockResolvedValue(true),
  };
}

function currentKeyBuffer(): ArrayBuffer {
  return urlBase64ToUint8Array(VAPID_KEY).slice().buffer;
}

const getSubscription = vi.fn();
const subscribe = vi.fn();

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("VITE_VAPID_PUBLIC_KEY", VAPID_KEY);
  vi.spyOn(Date, "now").mockReturnValue(NOW);
  for (const mock of [
    subscribePush,
    readPendingSubscription,
    readLastSyncedSubscription,
    writeLastSyncedSubscription,
    clearPendingSubscription,
    readPushEnabledMemberIds,
    addPushEnabledMemberId,
    getSubscription,
    subscribe,
  ]) {
    mock.mockClear();
  }
  readPendingSubscription.mockResolvedValue(undefined);
  readLastSyncedSubscription.mockResolvedValue(undefined);
  readPushEnabledMemberIds.mockResolvedValue([]);
  vi.stubGlobal("Notification", { permission: "granted" });
  vi.stubGlobal("PushManager", function PushManager() {});
  vi.stubGlobal("navigator", {
    serviceWorker: {
      ready: Promise.resolve({ pushManager: { getSubscription, subscribe } }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });
});

describe("syncPushSubscriptionHealth", () => {
  it("does nothing without notification permission", async () => {
    vi.stubGlobal("Notification", { permission: "default" });
    const sync = await loadSync();
    await sync(MEMBER_ID);
    expect(getSubscription).not.toHaveBeenCalled();
    expect(subscribePush).not.toHaveBeenCalled();
  });
});

describe("syncPushSubscriptionHealth, restoring push after sign-out", () => {
  it("never creates a subscription for a member who did not enable push on this device", async () => {
    getSubscription.mockResolvedValue(null);
    readPushEnabledMemberIds.mockResolvedValue(["member-b"]);
    const sync = await loadSync();
    await sync(MEMBER_ID);
    expect(subscribe).not.toHaveBeenCalled();
    expect(subscribePush).not.toHaveBeenCalled();
  });

  it("restores push for a returning member who enabled it here before signing out", async () => {
    getSubscription.mockResolvedValue(null);
    readPushEnabledMemberIds.mockResolvedValue([MEMBER_ID]);
    subscribe.mockResolvedValueOnce(
      makeSubscription("https://push.example/restored", currentKeyBuffer()),
    );
    const sync = await loadSync();
    await sync(MEMBER_ID);
    expect(subscribe).toHaveBeenCalledWith(
      expect.objectContaining({ userVisibleOnly: true }),
    );
    expect(subscribePush).toHaveBeenCalledWith({
      endpoint: "https://push.example/restored",
      keys: { p256dh: "key", auth: "auth" },
    });
    expect(writeLastSyncedSubscription).toHaveBeenCalledWith({
      endpoint: "https://push.example/restored",
      userId: MEMBER_ID,
      syncedAt: NOW,
    });
    expect(addPushEnabledMemberId).toHaveBeenCalledWith(MEMBER_ID);
  });

  it("tries the restore at most once per page load", async () => {
    getSubscription.mockResolvedValue(null);
    readPushEnabledMemberIds.mockResolvedValue([MEMBER_ID]);
    subscribe.mockRejectedValueOnce(new Error("push service unavailable"));
    const sync = await loadSync();
    await sync(MEMBER_ID);
    await sync(MEMBER_ID);
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(subscribePush).not.toHaveBeenCalled();
  });

  it("drops a restored subscription and posts nothing when the member signs out mid-restore", async () => {
    getSubscription.mockResolvedValue(null);
    readPushEnabledMemberIds.mockResolvedValue([MEMBER_ID]);
    const restored = makeSubscription(
      "https://push.example/restored",
      currentKeyBuffer(),
    );
    let isSignedOut = false;
    subscribe.mockImplementationOnce(() => {
      isSignedOut = true;
      return Promise.resolve(restored);
    });
    const sync = await loadSync();
    await sync(MEMBER_ID, () => isSignedOut);
    expect(restored.unsubscribe).toHaveBeenCalled();
    expect(subscribePush).not.toHaveBeenCalled();
  });
});

describe("syncPushSubscriptionHealth, existing subscriptions", () => {
  it("re-posts a fresh matching record once per page load, then skips later triggers", async () => {
    getSubscription.mockResolvedValue(
      makeSubscription("https://push.example/abc", currentKeyBuffer()),
    );
    readLastSyncedSubscription.mockResolvedValue({
      endpoint: "https://push.example/abc",
      userId: MEMBER_ID,
      syncedAt: NOW - DAY_MS,
    });
    const sync = await loadSync();
    await sync(MEMBER_ID);
    expect(subscribePush).toHaveBeenCalledTimes(1);
    // A later trigger in the same document (tab visible again) keeps the
    // normal skip rules.
    await sync(MEMBER_ID);
    expect(subscribePush).toHaveBeenCalledTimes(1);
  });

  it("retries the page-load POST on the next trigger when the first one failed", async () => {
    getSubscription.mockResolvedValue(
      makeSubscription("https://push.example/abc", currentKeyBuffer()),
    );
    readLastSyncedSubscription.mockResolvedValue({
      endpoint: "https://push.example/abc",
      userId: MEMBER_ID,
      syncedAt: NOW - DAY_MS,
    });
    subscribePush.mockRejectedValueOnce(new Error("offline"));
    const sync = await loadSync();
    await sync(MEMBER_ID);
    await sync(MEMBER_ID);
    expect(subscribePush).toHaveBeenCalledTimes(2);
  });

  it("re-posts and records the new member when another member synced this endpoint", async () => {
    getSubscription.mockResolvedValue(
      makeSubscription("https://push.example/abc", currentKeyBuffer()),
    );
    readLastSyncedSubscription.mockResolvedValue({
      endpoint: "https://push.example/abc",
      userId: "member-b",
      syncedAt: NOW - DAY_MS,
    });
    const sync = await loadSync();
    await sync(MEMBER_ID);
    expect(subscribePush).toHaveBeenCalledWith({
      endpoint: "https://push.example/abc",
      keys: { p256dh: "key", auth: "auth" },
    });
    expect(writeLastSyncedSubscription).toHaveBeenCalledWith({
      endpoint: "https://push.example/abc",
      userId: MEMBER_ID,
      syncedAt: NOW,
    });
    expect(addPushEnabledMemberId).toHaveBeenCalledWith(MEMBER_ID);
    expect(clearPendingSubscription).toHaveBeenCalled();
  });

  it("re-posts an unchanged endpoint whose last sync is older than seven days", async () => {
    getSubscription.mockResolvedValue(
      makeSubscription("https://push.example/abc", currentKeyBuffer()),
    );
    readLastSyncedSubscription.mockResolvedValue({
      endpoint: "https://push.example/abc",
      userId: MEMBER_ID,
      syncedAt: NOW - 8 * DAY_MS,
    });
    const sync = await loadSync();
    await sync(MEMBER_ID);
    expect(subscribePush).toHaveBeenCalledTimes(1);
  });

  it("re-posts a pending rotation even when the record matches", async () => {
    getSubscription.mockResolvedValue(
      makeSubscription("https://push.example/abc", currentKeyBuffer()),
    );
    readPendingSubscription.mockResolvedValue({
      endpoint: "https://push.example/abc",
    });
    readLastSyncedSubscription.mockResolvedValue({
      endpoint: "https://push.example/abc",
      userId: MEMBER_ID,
      syncedAt: NOW - DAY_MS,
    });
    const sync = await loadSync();
    await sync(MEMBER_ID);
    expect(subscribePush).toHaveBeenCalledTimes(1);
  });

  it("replaces a subscription made under a different VAPID key and posts the new one", async () => {
    const stale = makeSubscription(
      "https://push.example/old",
      new Uint8Array([1, 2, 3]).buffer,
    );
    getSubscription.mockResolvedValue(stale);
    subscribe.mockResolvedValue(
      makeSubscription("https://push.example/new", currentKeyBuffer()),
    );
    const sync = await loadSync();
    await sync(MEMBER_ID);
    expect(stale.unsubscribe).toHaveBeenCalled();
    expect(subscribe).toHaveBeenCalledWith(
      expect.objectContaining({ userVisibleOnly: true }),
    );
    expect(subscribePush).toHaveBeenCalledWith({
      endpoint: "https://push.example/new",
      keys: { p256dh: "key", auth: "auth" },
    });
  });

  it("leaves a subscription alone when the browser does not expose its key", async () => {
    const unknownKey = makeSubscription("https://push.example/abc", null);
    getSubscription.mockResolvedValue(unknownKey);
    readLastSyncedSubscription.mockResolvedValue({
      endpoint: "https://push.example/abc",
      userId: MEMBER_ID,
      syncedAt: NOW - DAY_MS,
    });
    const sync = await loadSync();
    await sync(MEMBER_ID);
    await sync(MEMBER_ID);
    expect(unknownKey.unsubscribe).not.toHaveBeenCalled();
    expect(subscribe).not.toHaveBeenCalled();
    // Only the once-per-page-load POST; no rotation.
    expect(subscribePush).toHaveBeenCalledTimes(1);
  });

  it("does not POST once cancelled (the member signed out mid-pass)", async () => {
    getSubscription.mockResolvedValue(
      makeSubscription("https://push.example/abc", currentKeyBuffer()),
    );
    const sync = await loadSync();
    await sync(MEMBER_ID, () => true);
    expect(subscribePush).not.toHaveBeenCalled();
  });

  it("swallows a failed POST and records nothing", async () => {
    getSubscription.mockResolvedValue(
      makeSubscription("https://push.example/abc", currentKeyBuffer()),
    );
    subscribePush.mockRejectedValueOnce(new Error("offline"));
    const sync = await loadSync();
    await expect(sync(MEMBER_ID)).resolves.toBeUndefined();
    expect(writeLastSyncedSubscription).not.toHaveBeenCalled();
    expect(addPushEnabledMemberId).not.toHaveBeenCalled();
  });
});
