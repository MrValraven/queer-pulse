import { act, renderHook, screen } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { closeReauthDialog, useReauthDialogRequest } from "./reauthDialogStore";
import { beginReauth, useReauthAvailabilitySync } from "./useReauthToken";

/** `isEmailCodeOn: null` is the switch before any status has been read. */
interface AvailabilityHarness {
  isEmailCodeOn: boolean | null;
  hasGoogle: boolean;
  refreshSession: Mock<() => Promise<boolean>>;
}

const harness = vi.hoisted<AvailabilityHarness>(() => ({
  isEmailCodeOn: true,
  hasGoogle: true,
  // Left pending, so the Google path stops before it navigates the page.
  refreshSession: vi.fn(() => new Promise<boolean>(() => {})),
}));

vi.mock("../../../shared/api/useIsEmailCodeSignInOn", () => ({
  useEmailCodeSignInState: () => harness.isEmailCodeOn,
}));

vi.mock("../../../app/providers/authContext", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../../../app/providers/authContext")>();
  return {
    ...original,
    useAuth: () => ({
      user: { email: "sam@example.com", hasGoogle: harness.hasGoogle },
    }),
  };
});

vi.mock("../../../shared/api/client", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../../../shared/api/client")>();
  return { ...original, refreshSession: harness.refreshSession };
});

const STATUS_PENDING =
  "We're still checking how to confirm it's you. Try again in a moment.";
const UNAVAILABLE =
  "We can't confirm it's you right now: sign-in codes are switched off. Write to us and our team will help.";

/** Mounts the sync as ReauthCompletionProvider does, beside a dialog probe.
 *  Nothing here loads the lazy `settings` namespace. */
function renderSync() {
  return renderHook(
    () => {
      useReauthAvailabilitySync();
      return { request: useReauthDialogRequest() };
    },
    { wrapper: TestProviders },
  );
}

beforeEach(() => {
  harness.isEmailCodeOn = true;
  harness.hasGoogle = true;
  harness.refreshSession.mockClear();
});

afterEach(() => {
  act(() => closeReauthDialog());
});

describe("beginReauth and the email code switch", () => {
  it("opens the code dialog when the switch is on", () => {
    const { result } = renderSync();
    act(() => beginReauth());
    expect(result.current.request).not.toBeNull();
    expect(harness.refreshSession).not.toHaveBeenCalled();
  });

  it("runs the Google redirect when the switch is off and the member has Google", () => {
    harness.isEmailCodeOn = false;
    const { result } = renderSync();
    act(() => beginReauth());
    expect(result.current.request).toBeNull();
    // The refresh is the first step of beginGoogleReauth.
    expect(harness.refreshSession).toHaveBeenCalledTimes(1);
  });

  it("shows the unavailable toast and stops quietly when off without Google", () => {
    harness.isEmailCodeOn = false;
    harness.hasGoogle = false;
    const hrefBefore = window.location.href;
    const { result } = renderSync();
    // One press straight after the first render, read at once: the copy comes
    // from the eager `shared` catalog, so it is whole with nothing loaded.
    act(() => beginReauth());
    expect(screen.getByText(UNAVAILABLE)).toBeInTheDocument();
    expect(
      screen.queryByText("shared:reauthUnavailable"),
    ).not.toBeInTheDocument();
    expect(result.current.request).toBeNull();
    expect(harness.refreshSession).not.toHaveBeenCalled();
    expect(window.location.href).toBe(hrefBefore);
  });

  it("runs the Google redirect while the switch is not known and the member has Google", () => {
    harness.isEmailCodeOn = null;
    const { result } = renderSync();
    act(() => beginReauth());
    expect(result.current.request).toBeNull();
    expect(harness.refreshSession).toHaveBeenCalledTimes(1);
  });

  it("shows the pending toast while the switch is not known and the member has no Google", () => {
    harness.isEmailCodeOn = null;
    harness.hasGoogle = false;
    const { result } = renderSync();
    act(() => beginReauth());
    expect(screen.getByText(STATUS_PENDING)).toBeInTheDocument();
    expect(screen.queryByText(UNAVAILABLE)).not.toBeInTheDocument();
    expect(result.current.request).toBeNull();
    expect(harness.refreshSession).not.toHaveBeenCalled();
  });

  it("opens the code dialog when nothing has synced the switch yet", () => {
    const { result } = renderHook(() => useReauthDialogRequest());
    act(() => beginReauth());
    expect(result.current).not.toBeNull();
  });
});
