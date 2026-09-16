import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// `usePushSubscription` reads VITE_VAPID_PUBLIC_KEY at module-eval time into a
// frozen const, and `enable()` bails early without one. So the module is
// (re)imported per test AFTER the env is stubbed — mirroring realtime.test's
// config-const pattern — rather than statically imported once.
async function loadUsePushSubscription() {
  return (await import("./usePushSubscription")).usePushSubscription;
}

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
const subscribePush = vi.fn((..._args: unknown[]) =>
  Promise.resolve({ ok: true }),
);
const unsubscribePush = vi.fn((..._args: unknown[]) =>
  Promise.resolve({ ok: true }),
);
vi.mock("./push.api", () => ({
  subscribePush: (...args: unknown[]) => subscribePush(...args),
  unsubscribePush: (...args: unknown[]) => unsubscribePush(...args),
}));
vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => ({ user: { id: "member-a" } }),
}));
const writeLastSyncedSubscription = vi.fn((..._args: unknown[]) =>
  Promise.resolve(),
);
const clearLastSyncedSubscription = vi.fn(() => Promise.resolve());
const addPushEnabledMemberId = vi.fn((..._args: unknown[]) =>
  Promise.resolve(),
);
const removePushEnabledMemberId = vi.fn((..._args: unknown[]) =>
  Promise.resolve(),
);
vi.mock("../../pushSubStore", () => ({
  writeLastSyncedSubscription: (...args: unknown[]) =>
    writeLastSyncedSubscription(...args),
  clearLastSyncedSubscription: () => clearLastSyncedSubscription(),
  addPushEnabledMemberId: (...args: unknown[]) =>
    addPushEnabledMemberId(...args),
  removePushEnabledMemberId: (...args: unknown[]) =>
    removePushEnabledMemberId(...args),
}));

const subscribe = vi.fn();
const getSubscription = vi.fn();

beforeEach(() => {
  vi.resetModules();
  // A valid URL-safe base64 key so `urlBase64ToUint8Array` decodes without
  // throwing; its exact value is irrelevant (the subscribe mock ignores it).
  vi.stubEnv("VITE_VAPID_PUBLIC_KEY", "dGVzdGtleQ");
  subscribePush.mockClear();
  unsubscribePush.mockClear();
  writeLastSyncedSubscription.mockClear();
  clearLastSyncedSubscription.mockClear();
  addPushEnabledMemberId.mockClear();
  removePushEnabledMemberId.mockClear();
  vi.stubGlobal("Notification", {
    permission: "default",
    requestPermission: vi.fn().mockResolvedValue("granted"),
  });
  vi.stubGlobal("PushManager", function PushManager() {});
  getSubscription.mockResolvedValue(null);
  subscribe.mockResolvedValue({
    endpoint: "https://push.example/abc",
    toJSON: () => ({
      endpoint: "https://push.example/abc",
      keys: { p256dh: "key", auth: "auth" },
    }),
    unsubscribe: vi.fn().mockResolvedValue(true),
  });
  vi.stubGlobal("navigator", {
    serviceWorker: {
      ready: Promise.resolve({
        pushManager: { subscribe, getSubscription },
      }),
      // The health re-sync moved to `usePushSubscriptionSync` (see its own
      // test); the listener pair stays so this mock also fits that hook.
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });
});
// NB: no local afterEach unstub. The shared setup (src/test/setup.ts) already
// runs `cleanup()` THEN `vi.unstubAllGlobals()` after every test. A local
// afterEach here would run FIRST (hooks are LIFO), tearing down the stubbed
// `navigator` before React unmounts the hook — whose effect cleanup calls
// `navigator.serviceWorker.removeEventListener` and would then throw.

describe("usePushSubscription", () => {
  it("reports supported when serviceWorker + PushManager + Notification exist", async () => {
    const usePushSubscription = await loadUsePushSubscription();
    const { result } = renderHook(() => usePushSubscription());
    expect(result.current.supported).toBe(true);
  });

  it("enable() requests permission, subscribes, and POSTs to the backend", async () => {
    const usePushSubscription = await loadUsePushSubscription();
    const { result } = renderHook(() => usePushSubscription());
    await act(async () => {
      await result.current.enable();
    });
    expect(subscribe).toHaveBeenCalledWith(
      expect.objectContaining({ userVisibleOnly: true }),
    );
    expect(subscribePush).toHaveBeenCalledWith({
      endpoint: "https://push.example/abc",
      keys: { p256dh: "key", auth: "auth" },
    });
    await waitFor(() => expect(result.current.isSubscribed).toBe(true));
  });

  it("enable() records the synced endpoint with the signed-in member and a time", async () => {
    const usePushSubscription = await loadUsePushSubscription();
    const { result } = renderHook(() => usePushSubscription());
    await act(async () => {
      await result.current.enable();
    });
    const [record] = writeLastSyncedSubscription.mock.calls[0] as [
      { endpoint: string; userId: string; syncedAt: unknown },
    ];
    expect(record.endpoint).toBe("https://push.example/abc");
    expect(record.userId).toBe("member-a");
    expect(typeof record.syncedAt).toBe("number");
    // Remembered across sign-out, so this member's next sign-in restores push.
    expect(addPushEnabledMemberId).toHaveBeenCalledWith("member-a");
  });

  it("enable() records nothing when the server POST fails", async () => {
    subscribePush.mockRejectedValueOnce(new Error("offline"));
    const usePushSubscription = await loadUsePushSubscription();
    const { result } = renderHook(() => usePushSubscription());
    await act(async () => {
      await result.current.enable();
    });
    expect(writeLastSyncedSubscription).not.toHaveBeenCalled();
    expect(addPushEnabledMemberId).not.toHaveBeenCalled();
  });

  it("disable() unsubscribes, drops the server row and clears the sync record", async () => {
    const existing = {
      endpoint: "https://push.example/abc",
      unsubscribe: vi.fn().mockResolvedValue(true),
    };
    getSubscription.mockResolvedValue(existing);
    const usePushSubscription = await loadUsePushSubscription();
    const { result } = renderHook(() => usePushSubscription());
    await act(async () => {
      await result.current.disable();
    });
    expect(existing.unsubscribe).toHaveBeenCalled();
    expect(unsubscribePush).toHaveBeenCalledWith("https://push.example/abc");
    expect(clearLastSyncedSubscription).toHaveBeenCalled();
    // An explicit turn-off is the only thing that stops a later restore.
    expect(removePushEnabledMemberId).toHaveBeenCalledWith("member-a");
    await waitFor(() => expect(result.current.isSubscribed).toBe(false));
  });
});
