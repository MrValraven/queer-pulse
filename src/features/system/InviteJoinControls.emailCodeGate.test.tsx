import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { PlatformStatusDTO } from "../../shared/api/platformStatus.api";
import { InviteJoinControls } from "./InviteJoinControls";

/**
 * The tests run in demo mode, where the switch is always on, so the switch
 * here reads the mocked status as live mode would.
 */
const harness = vi.hoisted(() => ({
  status: undefined as Partial<PlatformStatusDTO> | undefined,
}));

vi.mock("../../shared/api/usePlatformStatus", () => ({
  usePlatformStatus: () => ({ data: harness.status }),
}));

vi.mock("../../shared/api/useIsEmailCodeSignInOn", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../shared/api/useIsEmailCodeSignInOn")
    >();
  return {
    ...actual,
    useIsEmailCodeSignInOn: () =>
      actual.isEmailCodeSignInOn(harness.status, false),
  };
});

const INVITE_CODE = "QP-TEST-CODE";
const EMAIL_OPTION = { name: "Register with an email code" };

function renderControls() {
  return render(
    <TestProviders initialEntries={[`/invite/${INVITE_CODE}`]}>
      <InviteJoinControls
        inviteCode={INVITE_CODE}
        is18
        onIs18Change={vi.fn()}
        onUnder18={vi.fn()}
        onGoogle={vi.fn()}
        onEmailJoined={vi.fn()}
        onOpenTerms={vi.fn()}
        onOpenPrivacy={vi.fn()}
      />
    </TestProviders>,
  );
}

/** `system` is a lazy namespace: the Google button reading means it is in. */
async function expectGoogleButton() {
  expect(
    await screen.findByRole("button", { name: /Google/ }),
  ).toBeInTheDocument();
}

beforeEach(() => {
  harness.status = undefined;
});

describe("InviteJoinControls email code switch", () => {
  it("offers the email code option when emailCodeSignIn is true", async () => {
    harness.status = { emailCodeSignIn: true };
    renderControls();
    expect(await screen.findByRole("button", EMAIL_OPTION)).toBeInTheDocument();
  });

  it("hides the email code option when emailCodeSignIn is false", async () => {
    harness.status = { emailCodeSignIn: false };
    renderControls();
    await expectGoogleButton();
    expect(screen.queryByRole("button", EMAIL_OPTION)).not.toBeInTheDocument();
  });

  it("hides the email code option when an older backend leaves the field out", async () => {
    harness.status = { registrationOpen: true };
    renderControls();
    await expectGoogleButton();
    expect(screen.queryByRole("button", EMAIL_OPTION)).not.toBeInTheDocument();
  });
});
