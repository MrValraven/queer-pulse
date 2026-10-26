import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PlatformStatusDTO } from "./platformStatus.api";
import {
  useEmailCodeSignInState,
  useIsEmailCodeSignInOn,
} from "./useIsEmailCodeSignInOn";

const harness = vi.hoisted(() => ({
  isDemo: false,
  status: undefined as Partial<PlatformStatusDTO> | undefined,
}));

vi.mock("./usePlatformStatus", () => ({
  usePlatformStatus: () => ({ data: harness.status }),
}));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: harness.isDemo }),
}));

beforeEach(() => {
  harness.isDemo = false;
  harness.status = undefined;
});

describe("useIsEmailCodeSignInOn", () => {
  it("is on when the status says emailCodeSignIn: true", () => {
    harness.status = { emailCodeSignIn: true };
    const { result } = renderHook(() => useIsEmailCodeSignInOn());
    expect(result.current).toBe(true);
  });

  it("is off when the status says emailCodeSignIn: false", () => {
    harness.status = { emailCodeSignIn: false };
    const { result } = renderHook(() => useIsEmailCodeSignInOn());
    expect(result.current).toBe(false);
  });

  it("is off when an older backend leaves the field out", () => {
    harness.status = { registrationOpen: true };
    const { result } = renderHook(() => useIsEmailCodeSignInOn());
    expect(result.current).toBe(false);
  });

  it("is off while the status is still loading or has failed", () => {
    const { result } = renderHook(() => useIsEmailCodeSignInOn());
    expect(result.current).toBe(false);
  });

  it("is always on in demo mode", () => {
    harness.isDemo = true;
    harness.status = { emailCodeSignIn: false };
    const { result } = renderHook(() => useIsEmailCodeSignInOn());
    expect(result.current).toBe(true);
  });
});

describe("useEmailCodeSignInState", () => {
  it("is true when the status says emailCodeSignIn: true", () => {
    harness.status = { emailCodeSignIn: true };
    const { result } = renderHook(() => useEmailCodeSignInState());
    expect(result.current).toBe(true);
  });

  it("is false when the status says false or leaves the field out", () => {
    harness.status = { emailCodeSignIn: false };
    const { result, rerender } = renderHook(() => useEmailCodeSignInState());
    expect(result.current).toBe(false);
    harness.status = { registrationOpen: true };
    rerender();
    expect(result.current).toBe(false);
  });

  it("is null while no status has been read", () => {
    const { result } = renderHook(() => useEmailCodeSignInState());
    expect(result.current).toBeNull();
  });

  it("is true in demo mode", () => {
    harness.isDemo = true;
    const { result } = renderHook(() => useEmailCodeSignInState());
    expect(result.current).toBe(true);
  });
});
