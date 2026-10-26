import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePushRecoveryPrompt } from "./usePushRecoveryPrompt";
import {
  reportPushSyncOutcome,
  resetPushSyncOutcomeForTests,
} from "./pushSyncOutcomeStore";

/**
 * The prompt is live-member only: demo mode, a signed-out visitor, a session
 * still checking and a pending account all resolve to no prompt. For an active
 * member the pure decision runs against the reported outcome, the live
 * permission and the stored dismissal.
 */

interface PromptTestState {
  demoMode: boolean;
  auth: {
    loggedIn: boolean;
    checking: boolean;
    status: string;
    user: { id: string } | null;
  };
  pushEnabledMemberIds: string[];
  hasPushApis: boolean;
}

const state = vi.hoisted<PromptTestState>(() => ({
  demoMode: false,
  auth: {
    loggedIn: true,
    checking: false,
    status: "active",
    user: { id: "member-1" },
  },
  pushEnabledMemberIds: ["member-1"],
  hasPushApis: true,
}));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: state.demoMode }),
}));

vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => state.auth,
}));

vi.mock("../../pushSubStore", () => ({
  readPushEnabledMemberIds: () => Promise.resolve(state.pushEnabledMemberIds),
}));

vi.mock("./pushSupport", () => ({
  hasPushApis: () => state.hasPushApis,
}));

function stubPermission(permission: NotificationPermission) {
  vi.stubGlobal("Notification", { permission });
}

beforeEach(() => {
  state.demoMode = false;
  state.auth = {
    loggedIn: true,
    checking: false,
    status: "active",
    user: { id: "member-1" },
  };
  state.pushEnabledMemberIds = ["member-1"];
  state.hasPushApis = true;
  stubPermission("default");
  localStorage.clear();
  resetPushSyncOutcomeForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("usePushRecoveryPrompt", () => {
  it("returns null in demo mode even when a pass reported a failure", async () => {
    state.demoMode = true;
    reportPushSyncOutcome("member-1", "permissionNotGranted");
    const { result } = renderHook(() => usePushRecoveryPrompt());
    await act(async () => {});
    expect(result.current.reason).toBeNull();
  });

  it("returns null for a signed-out visitor", async () => {
    state.auth = { ...state.auth, loggedIn: false, user: null };
    const { result } = renderHook(() => usePushRecoveryPrompt());
    await act(async () => {});
    expect(result.current.reason).toBeNull();
  });

  it("returns null for a member whose account is not active", async () => {
    state.auth = { ...state.auth, status: "pending" };
    reportPushSyncOutcome("member-1", "permissionNotGranted");
    const { result } = renderHook(() => usePushRecoveryPrompt());
    await act(async () => {});
    expect(result.current.reason).toBeNull();
  });

  it("returns null while no pass has reported an outcome", async () => {
    const { result } = renderHook(() => usePushRecoveryPrompt());
    await act(async () => {});
    expect(result.current.reason).toBeNull();
  });

  it("returns the decision for an active member once a pass reports", async () => {
    stubPermission("denied");
    const { result } = renderHook(() => usePushRecoveryPrompt());
    act(() => reportPushSyncOutcome("member-1", "permissionNotGranted"));
    await waitFor(() => expect(result.current.reason).toBe("permissionDenied"));
  });

  it("clears the prompt and remembers the dismissal", async () => {
    const { result } = renderHook(() => usePushRecoveryPrompt());
    act(() => reportPushSyncOutcome("member-1", "permissionNotGranted"));
    await waitFor(() =>
      expect(result.current.reason).toBe("permissionDefault"),
    );
    act(() => result.current.dismiss());
    expect(result.current.reason).toBeNull();
  });
});
