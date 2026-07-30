import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

const subscribe = vi.fn();
const getSubscription = vi.fn();

beforeEach(() => {
  vi.resetModules();
  // A valid URL-safe base64 key so `urlBase64ToUint8Array` decodes without
  // throwing; its exact value is irrelevant (the subscribe mock ignores it).
  vi.stubEnv("VITE_VAPID_PUBLIC_KEY", "dGVzdGtleQ");
  subscribePush.mockClear();
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
    },
  });
});
afterEach(() => vi.unstubAllGlobals());

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
});
