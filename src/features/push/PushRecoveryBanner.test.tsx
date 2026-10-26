import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PushRecoveryReason } from "./pushResyncDecision";
import { PushRecoveryBanner } from "./PushRecoveryBanner";

/**
 * The banner is a thin view over `usePushRecoveryPrompt` (what to say) and
 * `usePushSubscription().enable` (the click action). Both are mocked so each
 * reason, the denied layout and the click outcomes can be driven directly.
 * Demo mode resolves to no reason inside the prompt hook (covered by its own
 * suite), so "hidden in demo" here is a null reason rendering nothing.
 */

interface BannerTestState {
  reason: PushRecoveryReason | null;
  enableResult:
    | { status: "enabled" }
    | { status: "denied" }
    | { status: "failed"; error: unknown };
}

const state = vi.hoisted<BannerTestState>(() => ({
  reason: "permissionDefault",
  enableResult: { status: "enabled" },
}));

const dismiss = vi.fn();
const enable = vi.fn(() => Promise.resolve(state.enableResult));
const showToast = vi.fn();
const reportPushSyncOutcome = vi.fn();

vi.mock("./usePushRecoveryPrompt", () => ({
  usePushRecoveryPrompt: () => ({ reason: state.reason, dismiss }),
}));

vi.mock("./usePushSubscription", () => ({
  usePushSubscription: () => ({ enable, busy: false }),
}));

vi.mock("./pushSyncOutcomeStore", () => ({
  reportPushSyncOutcome: (memberId: string, outcome: string) => {
    reportPushSyncOutcome(memberId, outcome);
  },
}));

vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => ({ user: { id: "member-1" } }),
}));

vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));

vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key: string) => key,
  }),
}));

vi.mock("../../shared/components/ui", () => ({
  Collapse: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

const ENABLE_LABEL = "settings:notifications.phonePush.recovery.action";

beforeEach(() => {
  state.reason = "permissionDefault";
  state.enableResult = { status: "enabled" };
  vi.clearAllMocks();
});

describe("PushRecoveryBanner", () => {
  it.each([
    ["permissionDefault", "bodyDefault"],
    ["permissionDenied", "bodyDenied"],
    ["subscribeFailed", "bodyFailed"],
  ] as const)("renders the %s copy", (reason, bodyKey) => {
    state.reason = reason;
    render(<PushRecoveryBanner />);
    expect(
      screen.getByText(`settings:notifications.phonePush.recovery.${bodyKey}`),
    ).toBeTruthy();
  });

  it("offers no button when permission is blocked", () => {
    state.reason = "permissionDenied";
    render(<PushRecoveryBanner />);
    expect(screen.queryByText(ENABLE_LABEL)).toBeNull();
  });

  it("renders nothing when there is no reason, as in demo mode", () => {
    state.reason = null;
    const { container } = render(<PushRecoveryBanner />);
    expect(container.innerHTML).toBe("");
  });

  it("runs enable from the click and reports a working outcome on success", async () => {
    render(<PushRecoveryBanner />);
    fireEvent.click(screen.getByText(ENABLE_LABEL));
    expect(enable).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(reportPushSyncOutcome).toHaveBeenCalledWith("member-1", "working"),
    );
    expect(showToast).toHaveBeenCalledWith(
      "settings:notifications.phonePush.recovery.done",
      "success",
    );
  });

  it("does not report a working outcome when the prompt is closed", async () => {
    state.enableResult = { status: "denied" };
    render(<PushRecoveryBanner />);
    fireEvent.click(screen.getByText(ENABLE_LABEL));
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        "settings:notifications.phonePush.recovery.promptClosed",
        "error",
      ),
    );
    expect(reportPushSyncOutcome).not.toHaveBeenCalled();
  });

  it("dismisses from the close button", () => {
    render(<PushRecoveryBanner />);
    fireEvent.click(
      screen.getByLabelText(
        "settings:notifications.phonePush.recovery.dismiss",
      ),
    );
    expect(dismiss).toHaveBeenCalledTimes(1);
  });
});
