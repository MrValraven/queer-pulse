import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type {
  EmailCodeChallenge,
  EmailCodeVerifyResult,
  ReauthCodeVerifyResult,
} from "./emailCode.api";
import { readEmailCodeFailure } from "./emailCodeFailure";
import {
  useRequestEmailCode,
  useVerifyEmailCode,
  useVerifyReauthCode,
} from "./useEmailCode";

const TEN_MINUTES_MS = 10 * 60 * 1000;
const SIXTY_SECONDS_MS = 60 * 1000;

function Wrapper({ children }: { children: ReactNode }) {
  return <TestProviders>{children}</TestProviders>;
}

describe("useEmailCode (demo)", () => {
  it("demo request answers a ten-minute challenge with a sixty-second cooldown", async () => {
    const { result } = renderHook(() => useRequestEmailCode(), {
      wrapper: Wrapper,
    });
    const before = Date.now();
    let challenge!: EmailCodeChallenge;
    await act(async () => {
      challenge = await result.current.mutateAsync({
        email: "member@queerpulse.test",
        locale: "en",
      });
    });
    const after = Date.now();
    const expiresAt = Date.parse(challenge.expiresAt);
    const resendAvailableAt = Date.parse(challenge.resendAvailableAt);
    expect(challenge.challengeId).toMatch(/^demo-challenge-/);
    expect(expiresAt).toBeGreaterThanOrEqual(before + TEN_MINUTES_MS);
    expect(expiresAt).toBeLessThanOrEqual(after + TEN_MINUTES_MS);
    expect(resendAvailableAt).toBeGreaterThanOrEqual(before + SIXTY_SECONDS_MS);
    expect(resendAvailableAt).toBeLessThanOrEqual(after + SIXTY_SECONDS_MS);
  });

  it("demo verify of 000000 rejects with code_incorrect", async () => {
    const { result } = renderHook(() => useVerifyEmailCode(), {
      wrapper: Wrapper,
    });
    let caught: unknown = null;
    await act(async () => {
      try {
        await result.current.mutateAsync({
          challengeId: "demo-challenge-1",
          code: "000000",
        });
      } catch (error) {
        caught = error;
      }
    });
    const failure = readEmailCodeFailure(caught);
    expect(failure.kind).toBe("reason");
    if (failure.kind !== "reason") return;
    expect(failure.reason).toBe("code_incorrect");
  });

  it("demo verify of any other six digits returns the redirect it was given", async () => {
    const { result } = renderHook(() => useVerifyEmailCode(), {
      wrapper: Wrapper,
    });
    let verified: EmailCodeVerifyResult | null = null;
    await act(async () => {
      verified = await result.current.mutateAsync({
        challengeId: "demo-challenge-1",
        code: "482913",
        redirect: "/events",
      });
    });
    expect(verified).toEqual({ redirectTo: "/events" });
  });

  it("demo reauth verify returns a token", async () => {
    const { result } = renderHook(() => useVerifyReauthCode(), {
      wrapper: Wrapper,
    });
    let reauth!: ReauthCodeVerifyResult;
    await act(async () => {
      reauth = await result.current.mutateAsync({
        challengeId: "demo-challenge-1",
        code: "482913",
      });
    });
    expect(reauth.reauthToken).toBe("demo-reauth-code");
    expect(Number.isNaN(Date.parse(reauth.expiresAt))).toBe(false);
  });
});
