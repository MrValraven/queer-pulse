import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";

/**
 * Quick Exit in live mode (SEC-48): the logout always goes out, with this
 * device's push endpoint, the persisted messaging cache is purged and marked
 * for the next launch, and the exit happens even when a wipe step throws.
 * The network and storage edges are mocked; `leaveNow` itself is real.
 */
interface QuickExitLiveMocks {
  postLogout: Mock<(pushEndpoint?: string) => Promise<boolean>>;
  setSessionState: Mock<(next: string) => void>;
  purgeMessagingCache: Mock<() => Promise<void>>;
  markQuickExitPending: Mock<() => void>;
  wipeMemberLocalData: Mock<(scopeId: string | null) => void>;
  logoutAndDetachPush: Mock<
    (logout: () => Promise<boolean>) => Promise<boolean>
  >;
}

const mocks = vi.hoisted<QuickExitLiveMocks>(() => ({
  postLogout: vi.fn(() => Promise.resolve(true)),
  setSessionState: vi.fn(),
  purgeMessagingCache: vi.fn(() => Promise.resolve()),
  markQuickExitPending: vi.fn(),
  wipeMemberLocalData: vi.fn(),
  logoutAndDetachPush: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("../auth/api/auth.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../auth/api/auth.api")>()),
  postLogout: mocks.postLogout,
}));
vi.mock("../push/push.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../push/push.api")>()),
  readThisDevicePushEndpoint: () => "https://push.example/device-1",
}));
vi.mock("../push/detachPushOnSignOut", () => ({
  logoutAndDetachPush: mocks.logoutAndDetachPush,
}));
vi.mock("../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/api/client")>()),
  setSessionState: mocks.setSessionState,
}));
vi.mock(
  "../../shared/api/queryPersistence/messagingCachePersistence",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../shared/api/queryPersistence/messagingCachePersistence")
    >()),
    markQuickExitPending: mocks.markQuickExitPending,
  }),
);
vi.mock("../../app/providers/wipeMemberLocalData", () => ({
  // The real runEach's contract: every step runs, a throw stops none.
  runEach: (steps: Record<string, () => void>) => {
    for (const run of Object.values(steps)) {
      try {
        run();
      } catch {
        // The real one logs the step name here.
      }
    }
  },
  wipeMemberLocalData: mocks.wipeMemberLocalData,
  wipeEveryScopeMessagingDrafts: vi.fn(),
  wipeMemberSessionCaches: () => {
    void mocks.purgeMessagingCache();
  },
}));

import { leaveNow, stopQuickExitStillHereWatchForTests } from "./useQuickExit";

const SAFE_DESTINATION = "https://www.google.com";
const realLocation = window.location;

function spyOnReplace() {
  const replace = vi.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { ...realLocation, replace },
  });
  return replace;
}

beforeEach(() => {
  mocks.postLogout.mockClear();
  mocks.setSessionState.mockClear();
  mocks.purgeMessagingCache.mockClear();
  mocks.markQuickExitPending.mockClear();
  mocks.wipeMemberLocalData.mockClear();
  mocks.logoutAndDetachPush.mockClear();
});

afterEach(() => {
  stopQuickExitStillHereWatchForTests();
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: realLocation,
  });
});

describe("leaveNow in live mode", () => {
  it("logs out with this device's push endpoint even while the session is unconfirmed", () => {
    const replace = spyOnReplace();

    leaveNow({ demoMode: false, isSignedIn: false, memberId: null }, vi.fn());

    expect(mocks.postLogout).toHaveBeenCalledWith(
      "https://push.example/device-1",
    );
    expect(mocks.setSessionState).toHaveBeenCalledWith("none");
    expect(mocks.purgeMessagingCache).toHaveBeenCalled();
    expect(mocks.markQuickExitPending).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith(SAFE_DESTINATION);
  });

  it("signs out before the wipe and still leaves when a wipe step throws", () => {
    const replace = spyOnReplace();
    mocks.wipeMemberLocalData.mockImplementationOnce(() => {
      throw new Error("storage blocked");
    });

    leaveNow({ demoMode: false, isSignedIn: true, memberId: "m-1" }, vi.fn());

    expect(mocks.postLogout).toHaveBeenCalledTimes(1);
    expect(mocks.postLogout.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.wipeMemberLocalData.mock.invocationCallOrder[0] ?? 0,
    );
    expect(mocks.purgeMessagingCache).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith(SAFE_DESTINATION);
  });

  it("runs the fallback when Back restores the page from the cache", () => {
    spyOnReplace();
    const onStillHere = vi.fn();

    leaveNow(
      { demoMode: false, isSignedIn: true, memberId: "m-1" },
      onStillHere,
    );
    window.dispatchEvent(
      new PageTransitionEvent("pageshow", { persisted: true }),
    );

    expect(onStillHere).toHaveBeenCalledTimes(1);
  });

  it("ignores a pageshow that is no cache restore", () => {
    spyOnReplace();
    const onStillHere = vi.fn();

    leaveNow(
      { demoMode: false, isSignedIn: true, memberId: "m-1" },
      onStillHere,
    );
    window.dispatchEvent(
      new PageTransitionEvent("pageshow", { persisted: false }),
    );

    expect(onStillHere).not.toHaveBeenCalled();
  });

  it("signs the tab out locally when the page is still here four seconds later", () => {
    vi.useFakeTimers();
    try {
      spyOnReplace();
      const onStillHere = vi.fn();

      leaveNow(
        { demoMode: false, isSignedIn: true, memberId: "m-1" },
        onStillHere,
      );
      expect(onStillHere).not.toHaveBeenCalled();
      // A slow redirect still pending after one second keeps its way out.
      vi.advanceTimersByTime(1_000);
      expect(onStillHere).not.toHaveBeenCalled();
      vi.advanceTimersByTime(3_000);

      expect(onStillHere).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
