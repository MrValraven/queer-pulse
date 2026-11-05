import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScreenWakeLock } from "./useScreenWakeLock";

type FakeSentinel = { release: ReturnType<typeof vi.fn> };

function installWakeLock(request: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "wakeLock", {
    configurable: true,
    value: { request },
  });
}

function makeSentinelRequest() {
  const sentinels: FakeSentinel[] = [];
  const request = vi.fn(() => {
    const sentinel: FakeSentinel = {
      release: vi.fn(() => Promise.resolve()),
    };
    sentinels.push(sentinel);
    return Promise.resolve(sentinel);
  });
  return { request, sentinels };
}

function sentinelAt(sentinels: FakeSentinel[], sentinelIndex: number) {
  const sentinel = sentinels[sentinelIndex];
  if (!sentinel) {
    throw new Error(`Wake lock sentinel ${sentinelIndex} was never requested`);
  }
  return sentinel;
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: state,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useScreenWakeLock", () => {
  beforeEach(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, "wakeLock");
  });

  it("requests a screen wake lock while active", async () => {
    const { request } = makeSentinelRequest();
    installWakeLock(request);
    renderHook(() => useScreenWakeLock(true));
    await flushPromises();
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith("screen");
  });

  it("requests again when the page becomes visible", async () => {
    const { request, sentinels } = makeSentinelRequest();
    installWakeLock(request);
    renderHook(() => useScreenWakeLock(true));
    await flushPromises();
    setVisibility("hidden");
    expect(request).toHaveBeenCalledTimes(1);
    setVisibility("visible");
    await flushPromises();
    expect(request).toHaveBeenCalledTimes(2);
    expect(sentinelAt(sentinels, 0).release).toHaveBeenCalledTimes(1);
  });

  it("releases the lock on deactivate and on unmount", async () => {
    const { request, sentinels } = makeSentinelRequest();
    installWakeLock(request);
    const { rerender, unmount } = renderHook(
      ({ isActive }) => useScreenWakeLock(isActive),
      { initialProps: { isActive: true } },
    );
    await flushPromises();
    rerender({ isActive: false });
    expect(sentinelAt(sentinels, 0).release).toHaveBeenCalledTimes(1);
    rerender({ isActive: true });
    await flushPromises();
    expect(sentinels).toHaveLength(2);
    unmount();
    expect(sentinelAt(sentinels, 1).release).toHaveBeenCalledTimes(1);
  });

  it("releases a lock that arrives after unmount", async () => {
    const sentinel: FakeSentinel = { release: vi.fn(() => Promise.resolve()) };
    let resolveRequest: (value: FakeSentinel) => void = () => undefined;
    const request = vi.fn(
      () =>
        new Promise<FakeSentinel>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    installWakeLock(request);
    const { unmount } = renderHook(() => useScreenWakeLock(true));
    unmount();
    resolveRequest(sentinel);
    await flushPromises();
    expect(sentinel.release).toHaveBeenCalledTimes(1);
  });

  it("does nothing where the API is missing", () => {
    Reflect.deleteProperty(navigator, "wakeLock");
    expect(() => {
      const { unmount } = renderHook(() => useScreenWakeLock(true));
      setVisibility("visible");
      unmount();
    }).not.toThrow();
  });

  it("swallows a refused request", async () => {
    const request = vi.fn(() =>
      Promise.reject(new Error("NotAllowedError: wake lock refused")),
    );
    installWakeLock(request);
    const { unmount } = renderHook(() => useScreenWakeLock(true));
    await flushPromises();
    expect(request).toHaveBeenCalledTimes(1);
    expect(() => unmount()).not.toThrow();
  });
});
