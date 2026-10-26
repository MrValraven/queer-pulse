import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  closeReauthDialog,
  forgetReauthChallenge,
  openReauthDialog,
  readLiveReauthChallenge,
  rememberReauthChallenge,
  useReauthDialogRequest,
} from "./reauthDialogStore";

afterEach(() => {
  act(() => closeReauthDialog());
});

describe("reauthDialogStore", () => {
  it("starts closed", () => {
    const { result } = renderHook(() => useReauthDialogRequest());
    expect(result.current).toBeNull();
  });

  it("open publishes a request with a fresh id each time", () => {
    const { result } = renderHook(() => useReauthDialogRequest());

    act(() => openReauthDialog());
    const firstRequest = result.current;
    expect(firstRequest).not.toBeNull();

    act(() => openReauthDialog());
    const secondRequest = result.current;
    expect(secondRequest).not.toBeNull();
    expect(secondRequest?.id).not.toBe(firstRequest?.id);
  });

  it("close clears it", () => {
    const { result } = renderHook(() => useReauthDialogRequest());

    act(() => openReauthDialog());
    expect(result.current).not.toBeNull();

    act(() => closeReauthDialog());
    expect(result.current).toBeNull();
  });

  it("close with another request's id leaves the newer dialog open", () => {
    const { result } = renderHook(() => useReauthDialogRequest());

    act(() => openReauthDialog());
    const firstId = result.current?.id;
    act(() => openReauthDialog());
    const secondId = result.current?.id;

    act(() => closeReauthDialog(firstId));
    expect(result.current?.id).toBe(secondId);

    act(() => closeReauthDialog(secondId));
    expect(result.current).toBeNull();
  });

  it("passes onConfirmed through", () => {
    const onConfirmed = vi.fn();
    const { result } = renderHook(() => useReauthDialogRequest());

    act(() => openReauthDialog({ onConfirmed }));
    result.current?.onConfirmed?.();

    expect(onConfirmed).toHaveBeenCalledTimes(1);
  });
});

describe("the kept reauth challenge", () => {
  const NOW = Date.parse("2026-10-26T12:00:00.000Z");
  const CHALLENGE = {
    challengeId: "challenge-1",
    expiresAt: "2026-10-26T12:10:00.000Z",
    resendAvailableAt: "2026-10-26T12:01:00.000Z",
    email: "sam@example.com",
  };

  afterEach(() => {
    forgetReauthChallenge();
  });

  it("hands back a live challenge to the account that asked", () => {
    rememberReauthChallenge(CHALLENGE, "member-1");
    expect(readLiveReauthChallenge("member-1", NOW)).toEqual(CHALLENGE);
  });

  it("keeps it from another account and from a signed-out tab", () => {
    rememberReauthChallenge(CHALLENGE, "member-1");
    expect(readLiveReauthChallenge("member-2", NOW)).toBeNull();
    expect(readLiveReauthChallenge(null, NOW)).toBeNull();
  });

  it("drops it once the code has expired", () => {
    rememberReauthChallenge(CHALLENGE, "member-1");
    const afterExpiry = Date.parse(CHALLENGE.expiresAt) + 1;
    expect(readLiveReauthChallenge("member-1", afterExpiry)).toBeNull();
    expect(readLiveReauthChallenge("member-1", NOW)).toBeNull();
  });

  it("forget clears it", () => {
    rememberReauthChallenge(CHALLENGE, "member-1");
    forgetReauthChallenge();
    expect(readLiveReauthChallenge("member-1", NOW)).toBeNull();
  });
});
