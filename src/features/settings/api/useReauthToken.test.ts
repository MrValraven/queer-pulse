import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { closeReauthDialog, useReauthDialogRequest } from "./reauthDialogStore";
import { useReauth } from "./useAccountMutations";
import {
  beginReauth,
  cacheReauthToken,
  getCachedReauthToken,
} from "./useReauthToken";

const HOUR_MS = 60 * 60 * 1000;

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  act(() => closeReauthDialog());
  sessionStorage.clear();
});

describe("useReauthToken", () => {
  it("beginReauth opens the dialog and leaves the page alone", () => {
    const hrefBefore = window.location.href;
    const { result } = renderHook(() => useReauthDialogRequest());
    expect(result.current).toBeNull();

    act(() => beginReauth());

    expect(result.current).not.toBeNull();
    expect(window.location.href).toBe(hrefBefore);
  });

  it("cacheReauthToken is read back by getCachedReauthToken", () => {
    const expiresAt = new Date(Date.now() + HOUR_MS).toISOString();

    cacheReauthToken("fresh-token", expiresAt);

    expect(getCachedReauthToken()).toBe("fresh-token");
  });

  it("an expired cached token reads as null and is cleared", () => {
    const expiresAt = new Date(Date.now() - HOUR_MS).toISOString();
    cacheReauthToken("stale-token", expiresAt);

    expect(getCachedReauthToken()).toBeNull();
    expect(sessionStorage.getItem("qp_reauth_token")).toBeNull();
    expect(sessionStorage.getItem("qp_reauth_expires_at")).toBeNull();
  });

  it("demo opens the code dialog and reads the token it caches", () => {
    const { result } = renderHook(
      () => ({ reauth: useReauth(), request: useReauthDialogRequest() }),
      { wrapper: TestProviders },
    );
    expect(result.current.reauth.getReauthToken()).toBeNull();

    act(() => result.current.reauth.beginReauth());
    expect(result.current.request).not.toBeNull();

    cacheReauthToken(
      "demo-reauth-code",
      new Date(Date.now() + HOUR_MS).toISOString(),
    );
    expect(result.current.reauth.getReauthToken()).toBe("demo-reauth-code");
  });
});
