import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import type { EmailCodeFieldFailure } from "./api/emailCodeFailure";
import {
  useEmailCodeFlow,
  type EmailCodeFlow,
  type UseEmailCodeFlowOptions,
} from "./useEmailCodeFlow";

// Demo mode answers every call by default; a test that needs a specific
// backend answer or a look at the body switches the call over to its mock.
const mockVerify = vi.hoisted(() => ({ isActive: false, verify: vi.fn() }));
const mockRequest = vi.hoisted(() => ({ isActive: false, request: vi.fn() }));

vi.mock("./api/useEmailCode", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api/useEmailCode")>();
  return {
    ...actual,
    useRequestEmailCode: () => {
      const real = actual.useRequestEmailCode();
      return mockRequest.isActive
        ? { ...real, mutateAsync: mockRequest.request }
        : real;
    },
    useVerifyEmailCode: () => {
      const real = actual.useVerifyEmailCode();
      return mockVerify.isActive
        ? { ...real, mutateAsync: mockVerify.verify }
        : real;
    },
  };
});

const SENT_TO = "sam@example.com";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <TestProviders initialEntries={["/auth/sign-in"]}>{children}</TestProviders>
  );
}

function renderFlow(options: Partial<UseEmailCodeFlowOptions> = {}) {
  const onDemoSignedIn = vi.fn();
  const rendered = renderHook(
    () => {
      const flow = useEmailCodeFlow({
        redirect: "/feed",
        onDemoSignedIn,
        ...options,
      });
      const location = useLocation();
      return { flow, location };
    },
    { wrapper },
  );
  return { ...rendered, onDemoSignedIn };
}

type FlowResult = { current: { flow: EmailCodeFlow } };

async function reachCodeStep(result: FlowResult, typed: string = SENT_TO) {
  act(() => {
    result.current.flow.setEmail(typed);
  });
  await act(async () => {
    await result.current.flow.requestCode();
  });
}

async function verify(result: FlowResult, code: string) {
  act(() => {
    result.current.flow.setCode(code);
  });
  await act(async () => {
    await result.current.flow.verifyCode(code);
  });
}

function rejectVerifyWith(status: number, body: Record<string, unknown>) {
  mockVerify.verify.mockRejectedValueOnce(new ApiError(status, "x", body));
}

describe("useEmailCodeFlow", () => {
  beforeEach(() => {
    mockVerify.isActive = false;
    mockVerify.verify.mockReset();
    mockRequest.isActive = false;
    mockRequest.request.mockReset();
  });

  it("rejects a malformed email without a request", async () => {
    const { result } = renderFlow();
    await reachCodeStep(result, "nope");
    const failure = result.current.flow.fieldFailure;
    expect(failure?.kind === "reason" && failure.reason).toBe("email_invalid");
    expect(result.current.flow.step).toBe("email");
    expect(result.current.flow.isRequesting).toBe(false);
  });

  it("trims and lowercases the address it shows", async () => {
    mockRequest.isActive = true;
    mockRequest.request.mockResolvedValueOnce({
      challengeId: "challenge-1",
      expiresAt: "2026-10-26T10:10:00.000Z",
      resendAvailableAt: "2026-10-26T10:01:00.000Z",
    });
    const { result } = renderFlow();
    await reachCodeStep(result, " Sam@Example.com ");
    expect(mockRequest.request).toHaveBeenCalledTimes(1);
    expect(mockRequest.request).toHaveBeenCalledWith({
      email: SENT_TO,
      locale: expect.stringMatching(/^(en|pt)$/) as unknown,
    });
    expect(result.current.flow.sentTo).toBe(SENT_TO);
    expect(result.current.flow.step).toBe("code");
    expect(result.current.flow.resendAvailableAt).toBe(
      "2026-10-26T10:01:00.000Z",
    );
  });

  it("runs validateBeforeRequest before asking for a code", async () => {
    const nameRequired: EmailCodeFieldFailure = {
      kind: "reason",
      reason: "name_required",
    };
    const validateBeforeRequest = vi.fn(() => nameRequired);
    const { result } = renderFlow({ validateBeforeRequest });
    await reachCodeStep(result);
    expect(validateBeforeRequest).toHaveBeenCalledTimes(1);
    expect(result.current.flow.step).toBe("email");
    const failure = result.current.flow.fieldFailure;
    expect(failure?.kind === "reason" && failure.reason).toBe("name_required");
  });

  it("000000 shows code_incorrect with attempts left and clears the code", async () => {
    const { result } = renderFlow();
    await reachCodeStep(result);
    await verify(result, "000000");
    expect(result.current.flow.fieldFailure).toEqual({
      kind: "reason",
      reason: "code_incorrect",
      attemptsLeft: 4,
    });
    expect(result.current.flow.code).toBe("");
    expect(result.current.flow.isVerifying).toBe(false);
  });

  it("any other six digits signs in through onDemoSignedIn", async () => {
    const { result, onDemoSignedIn } = renderFlow();
    await reachCodeStep(result);
    await verify(result, "123456");
    expect(onDemoSignedIn).toHaveBeenCalledTimes(1);
    expect(result.current.flow.fieldFailure).toBeNull();
  });

  it("ignores a verify while one is in flight", async () => {
    const { result, onDemoSignedIn } = renderFlow();
    await reachCodeStep(result);
    await act(async () => {
      await Promise.all([
        result.current.flow.verifyCode("123456"),
        result.current.flow.verifyCode("123456"),
      ]);
    });
    expect(onDemoSignedIn).toHaveBeenCalledTimes(1);
  });

  it("ignores resend and a switch of address while a verify is in flight", async () => {
    const { result, onDemoSignedIn } = renderFlow();
    await reachCodeStep(result);
    await act(async () => {
      const pending = result.current.flow.verifyCode("123456");
      result.current.flow.switchToDifferentEmail();
      await result.current.flow.resendCode();
      await pending;
    });
    expect(result.current.flow.step).toBe("code");
    expect(result.current.flow.sentTo).toBe(SENT_TO);
    expect(result.current.flow.hasResent).toBe(false);
    expect(onDemoSignedIn).toHaveBeenCalledTimes(1);
  });

  it("resend clears the code and the error", async () => {
    const { result } = renderFlow();
    await reachCodeStep(result);
    await verify(result, "000000");
    act(() => {
      result.current.flow.setCode("12");
    });
    await act(async () => {
      await result.current.flow.resendCode();
    });
    expect(result.current.flow.fieldFailure).toBeNull();
    expect(result.current.flow.code).toBe("");
    expect(result.current.flow.hasResent).toBe(true);
  });

  it("switchToDifferentEmail returns to the email step", async () => {
    const { result } = renderFlow();
    await reachCodeStep(result);
    act(() => {
      result.current.flow.setCode("123");
      result.current.flow.switchToDifferentEmail();
    });
    expect(result.current.flow.step).toBe("email");
    expect(result.current.flow.email).toBe(SENT_TO);
    expect(result.current.flow.sentTo).toBeNull();
    expect(result.current.flow.code).toBe("");
    expect(result.current.flow.hasResent).toBe(false);
  });

  it("asks for focus on the email field only after a switch back to it", async () => {
    const { result } = renderFlow();
    expect(result.current.flow.hasReturnedToEmail).toBe(false);
    await reachCodeStep(result);
    act(() => {
      result.current.flow.switchToDifferentEmail();
    });
    expect(result.current.flow.hasReturnedToEmail).toBe(true);
    await reachCodeStep(result);
    expect(result.current.flow.hasReturnedToEmail).toBe(false);
  });

  it("invite_required with a status URL opens the status page", async () => {
    mockVerify.isActive = true;
    rejectVerifyWith(403, {
      reason: "invite_required",
      statusUrl: "https://queerpulse.com/auth/request-invite/status?token=abc",
    });
    const { result } = renderFlow();
    await reachCodeStep(result);
    await verify(result, "123456");
    const { pathname, search } = result.current.location;
    expect(pathname + search).toBe("/auth/request-invite/status?token=abc");
  });

  it("a signup refusal lands in signupFailure and keeps the code", async () => {
    mockVerify.isActive = true;
    rejectVerifyWith(403, { reason: "invite_invalid" });
    const { result } = renderFlow();
    await reachCodeStep(result);
    await verify(result, "123456");
    expect(result.current.flow.signupFailure).toEqual({
      kind: "signup",
      reason: "invite_invalid",
    });
    expect(result.current.flow.step).toBe("code");
    expect(result.current.flow.code).toBe("123456");
  });

  it("name_required keeps the code for a second verify", async () => {
    mockVerify.isActive = true;
    rejectVerifyWith(400, { reason: "name_required" });
    mockVerify.verify.mockResolvedValueOnce({ redirectTo: "/feed" });
    const { result, onDemoSignedIn } = renderFlow();
    await reachCodeStep(result);
    await verify(result, "123456");
    const failure = result.current.flow.fieldFailure;
    expect(failure?.kind === "reason" && failure.reason).toBe("name_required");
    expect(result.current.flow.code).toBe("123456");

    await act(async () => {
      await result.current.flow.verifyCode("123456");
    });
    expect(mockVerify.verify).toHaveBeenCalledTimes(2);
    const [firstRequest, secondRequest] = mockVerify.verify.mock.calls.map(
      (call) => call[0] as unknown,
    );
    expect(secondRequest).toEqual(firstRequest);
    expect(secondRequest).toMatchObject({
      challengeId: expect.stringMatching(/^demo-challenge-/) as unknown,
      code: "123456",
      redirect: "/feed",
    });
    expect(onDemoSignedIn).toHaveBeenCalledTimes(1);
  });

  it("a network failure keeps the code", async () => {
    mockVerify.isActive = true;
    mockVerify.verify.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const { result } = renderFlow();
    await reachCodeStep(result);
    await verify(result, "123456");
    expect(result.current.flow.fieldFailure).toEqual({ kind: "network" });
    expect(result.current.flow.code).toBe("123456");
  });
});

describe("useEmailCodeFlow isRegistration", () => {
  beforeEach(() => {
    mockRequest.isActive = false;
    mockRequest.request.mockReset();
  });

  it("sends isRegistration on the first request and on resend when the option is set", async () => {
    mockRequest.isActive = true;
    mockRequest.request.mockResolvedValue({
      challengeId: "challenge-1",
      expiresAt: "2026-10-26T10:10:00.000Z",
      resendAvailableAt: "2026-10-26T10:01:00.000Z",
    });
    const { result } = renderFlow({ isRegistration: true });
    await reachCodeStep(result);
    await act(async () => {
      await result.current.flow.resendCode();
    });
    expect(mockRequest.request).toHaveBeenCalledTimes(2);
    for (const call of mockRequest.request.mock.calls) {
      expect(call[0]).toMatchObject({ email: SENT_TO, isRegistration: true });
    }
  });

  it("leaves isRegistration out of the request and resend by default", async () => {
    mockRequest.isActive = true;
    mockRequest.request.mockResolvedValue({
      challengeId: "challenge-1",
      expiresAt: "2026-10-26T10:10:00.000Z",
      resendAvailableAt: "2026-10-26T10:01:00.000Z",
    });
    const { result } = renderFlow();
    await reachCodeStep(result);
    await act(async () => {
      await result.current.flow.resendCode();
    });
    expect(mockRequest.request).toHaveBeenCalledTimes(2);
    for (const call of mockRequest.request.mock.calls) {
      expect((call[0] as { isRegistration?: boolean }).isRegistration).toBe(
        undefined,
      );
    }
  });
});
