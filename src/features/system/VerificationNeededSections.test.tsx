import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ConfirmMethod } from "./VerificationNeededSections";

const harness = vi.hoisted<{
  isEmailCodeOn: boolean | null;
  hasGoogle: boolean;
}>(() => ({ isEmailCodeOn: true, hasGoogle: true }));

vi.mock("../../shared/api/useIsEmailCodeSignInOn", () => ({
  useEmailCodeSignInState: () => harness.isEmailCodeOn,
}));

vi.mock("../../app/providers/authContext", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../../app/providers/authContext")>();
  return {
    ...original,
    useAuth: () => ({
      user: { email: "sam@example.com", hasGoogle: harness.hasGoogle },
    }),
  };
});

const CODE_INTRO =
  "Confirming means entering a code we email you now, so a session someone else left open can't carry this through.";
const GOOGLE_INTRO =
  "Confirming means signing in with Google again, so a session someone else left open can't carry this through.";

function renderLiveConfirm() {
  render(
    <TestProviders>
      <ConfirmMethod isBusy={false} isLiveStepUp onVerify={vi.fn()} />
    </TestProviders>,
  );
}

beforeEach(() => {
  harness.isEmailCodeOn = true;
  harness.hasGoogle = true;
});

describe("ConfirmMethod live copy", () => {
  it("names the emailed code while sign-in codes are on", async () => {
    renderLiveConfirm();
    expect(await screen.findByText(CODE_INTRO)).toBeInTheDocument();
  });

  it("keeps the code copy for a member without Google while codes are off", async () => {
    harness.isEmailCodeOn = false;
    harness.hasGoogle = false;
    renderLiveConfirm();
    expect(await screen.findByText(CODE_INTRO)).toBeInTheDocument();
    expect(screen.queryByText(GOOGLE_INTRO)).not.toBeInTheDocument();
  });

  it("names Google while sign-in codes are switched off and the member has Google", async () => {
    harness.isEmailCodeOn = false;
    renderLiveConfirm();
    expect(await screen.findByText(GOOGLE_INTRO)).toBeInTheDocument();
    expect(screen.queryByText(CODE_INTRO)).not.toBeInTheDocument();
  });

  it("names Google for a member with Google while the switch is not known", async () => {
    harness.isEmailCodeOn = null;
    renderLiveConfirm();
    expect(await screen.findByText(GOOGLE_INTRO)).toBeInTheDocument();
  });

  it("keeps the code copy for a member without Google while the switch is not known", async () => {
    harness.isEmailCodeOn = null;
    harness.hasGoogle = false;
    renderLiveConfirm();
    expect(await screen.findByText(CODE_INTRO)).toBeInTheDocument();
  });
});
