import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PUSH_ENDPOINT_READ_BUDGET_MS,
  logoutAndDetachPush,
} from "./detachPushOnSignOut";

const clearLastSyncedSubscription = vi.fn(() => Promise.resolve());
const clearPendingSubscription = vi.fn(() => Promise.resolve());
vi.mock("../../pushSubStore", () => ({
  clearLastSyncedSubscription: () => clearLastSyncedSubscription(),
  clearPendingSubscription: () => clearPendingSubscription(),
}));

const ENDPOINT = "https://push.example/abc";

function makeSubscription(
  unsubscribe: () => Promise<boolean> = () => Promise.resolve(true),
) {
  return { endpoint: ENDPOINT, unsubscribe: vi.fn(unsubscribe) };
}

function makeShownNotification() {
  return { close: vi.fn() };
}

function makeRegistration(
  subscription: unknown,
  shownNotifications: unknown[] = [],
) {
  return {
    pushManager: { getSubscription: () => Promise.resolve(subscription) },
    getNotifications: vi.fn((): Promise<unknown[]> =>
      Promise.resolve(shownNotifications),
    ),
  };
}

/** Stubs a navigator with a service worker and the Badging API. */
function stubServiceWorker(getRegistration: () => Promise<unknown>) {
  const clearAppBadge = vi.fn(() => Promise.resolve());
  vi.stubGlobal("navigator", {
    serviceWorker: { getRegistration },
    clearAppBadge,
  });
  return clearAppBadge;
}

function makeLogout() {
  return vi.fn((_pushEndpoint?: string) => Promise.resolve(true));
}

beforeEach(() => {
  clearLastSyncedSubscription.mockClear();
  clearPendingSubscription.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("logoutAndDetachPush", () => {
  it("sends one logout naming this device's endpoint and detaches the browser side", async () => {
    const subscription = makeSubscription();
    const shownNotifications = [
      makeShownNotification(),
      makeShownNotification(),
    ];
    const clearAppBadge = stubServiceWorker(() =>
      Promise.resolve(makeRegistration(subscription, shownNotifications)),
    );
    const logout = makeLogout();

    await expect(logoutAndDetachPush(logout)).resolves.toBe(true);

    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith(ENDPOINT);
    expect(subscription.unsubscribe).toHaveBeenCalled();
    for (const shownNotification of shownNotifications) {
      expect(shownNotification.close).toHaveBeenCalled();
    }
    expect(clearAppBadge).toHaveBeenCalled();
    expect(clearLastSyncedSubscription).toHaveBeenCalled();
    expect(clearPendingSubscription).toHaveBeenCalled();
  });

  it("dispatches logout without waiting for the browser unsubscribe to finish", async () => {
    const subscription = makeSubscription(() => new Promise<boolean>(() => {}));
    stubServiceWorker(() => Promise.resolve(makeRegistration(subscription)));
    const logout = makeLogout();

    void logoutAndDetachPush(logout);

    await vi.waitFor(() => expect(logout).toHaveBeenCalledWith(ENDPOINT));
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });

  it("logs out without an endpoint when this device has no subscription, and still closes the tray and clears the records", async () => {
    const shownNotification = makeShownNotification();
    stubServiceWorker(() =>
      Promise.resolve(makeRegistration(null, [shownNotification])),
    );
    const logout = makeLogout();

    await logoutAndDetachPush(logout);

    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout.mock.calls[0]?.[0]).toBeUndefined();
    expect(shownNotification.close).toHaveBeenCalled();
    expect(clearLastSyncedSubscription).toHaveBeenCalled();
    expect(clearPendingSubscription).toHaveBeenCalled();
  });

  it("logs out without an endpoint on a browser without service workers", async () => {
    vi.stubGlobal("navigator", {});
    const logout = makeLogout();

    await logoutAndDetachPush(logout);

    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout.mock.calls[0]?.[0]).toBeUndefined();
  });

  it("sends logout without an endpoint once the read budget passes, clearing the records meanwhile", async () => {
    vi.useFakeTimers();
    stubServiceWorker(() => new Promise(() => {}));
    const logout = makeLogout();

    void logoutAndDetachPush(logout);
    await vi.advanceTimersByTimeAsync(PUSH_ENDPOINT_READ_BUDGET_MS - 1);
    expect(logout).not.toHaveBeenCalled();
    expect(clearLastSyncedSubscription).toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);

    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout.mock.calls[0]?.[0]).toBeUndefined();
  });

  it("still logs out when closing notifications and unsubscribing both fail", async () => {
    const subscription = makeSubscription(() =>
      Promise.reject(new Error("gone")),
    );
    const registration = makeRegistration(subscription);
    registration.getNotifications.mockImplementation(() =>
      Promise.reject(new Error("no worker")),
    );
    stubServiceWorker(() => Promise.resolve(registration));
    const logout = makeLogout();

    await expect(logoutAndDetachPush(logout)).resolves.toBe(true);
    expect(logout).toHaveBeenCalledWith(ENDPOINT);
  });
});
