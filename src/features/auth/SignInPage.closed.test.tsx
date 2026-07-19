import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SignInPage } from "./SignInPage";
import type { PlatformStatusDTO } from "../../shared/api/platformStatus.api";

/**
 * SignInPage calls usePlatformStatus() itself (it isn't passed in as a prop),
 * so the query boundary is mocked directly here — same convention as
 * AdminSettingsAccess.test.tsx / AdminSettingsHistory.test.tsx — to get full
 * control over exactly what the "closed" and "unreachable" cases render,
 * without needing a live/demo network round trip. `status` starts `undefined`
 * so tests that never touch it exercise the fail-open path by default: a
 * loading OR errored `usePlatformStatus()` looks identical to the component
 * (both hand back `data: undefined`), so one variable covers both.
 */
let status: Partial<PlatformStatusDTO> | undefined;
vi.mock("../../shared/api/usePlatformStatus", () => ({
  usePlatformStatus: () => ({ data: status }),
}));

function renderSignIn(initialEntries = ["/auth/sign-in"]) {
  return render(
    <TestProviders initialEntries={initialEntries}>
      <SignInPage />
    </TestProviders>,
  );
}

describe("SignInPage — closed states", () => {
  it("?error=registration_disabled renders the registration-paused notice", () => {
    status = undefined;
    renderSignIn(["/auth/sign-in?error=registration_disabled"]);

    expect(
      screen.getByText(
        "We’re not creating new accounts right now. If you already have one, you can still sign in.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("New accounts are paused")).toBeInTheDocument();
  });

  it("registrationOpen: false renders the closed state and still offers sign-in", () => {
    status = {
      registrationOpen: false,
      joinRequestsOpen: true,
      locked: false,
      lockdownMessage: null,
      registrationClosedMessage: "We paused signups for a bit.",
    };
    renderSignIn();

    // The admin's own message wins over the catalog fallback.
    expect(screen.getByText("We paused signups for a bit.")).toBeInTheDocument();
    // Sign-in itself is never gated on this flag — the whole point of it.
    expect(
      screen.getByRole("button", { name: /Continue with Google/ }),
    ).toBeEnabled();
  });

  it("fails open: a failed GET /platform-status renders the page exactly as normal", () => {
    // `data` is `undefined` on both a still-loading and an errored query, so
    // this one variable exercises the fail-open branch either way. This is the
    // regression that matters most: a broken status endpoint must never
    // silently block a legitimate sign-in.
    status = undefined;
    renderSignIn();

    expect(screen.queryByText("New accounts are paused")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Continue with Google/ }),
    ).toBeEnabled();
  });
});
