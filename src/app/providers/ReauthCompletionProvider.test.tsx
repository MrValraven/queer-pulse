import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ReauthCompletionProvider } from "./ReauthCompletionProvider";

const harness = vi.hoisted<{ isEmailCodeOn: boolean | null }>(() => ({
  isEmailCodeOn: true,
}));

vi.mock("../../shared/api/useIsEmailCodeSignInOn", () => ({
  useIsEmailCodeSignInOn: () => harness.isEmailCodeOn === true,
  useEmailCodeSignInState: () => harness.isEmailCodeOn,
}));

// A marker stands in for the dialog, so the test reads whether it is mounted.
vi.mock("../../features/settings/ReauthCodeDialog", () => ({
  ReauthCodeDialog: () => <div data-testid="reauth-code-dialog" />,
}));

function renderProvider() {
  render(
    <TestProviders>
      <ReauthCompletionProvider>
        <main data-testid="page" />
      </ReauthCompletionProvider>
    </TestProviders>,
  );
}

beforeEach(() => {
  harness.isEmailCodeOn = true;
});

describe("ReauthCompletionProvider", () => {
  it("mounts the code dialog when the email code switch is on", () => {
    renderProvider();
    expect(screen.getByTestId("reauth-code-dialog")).toBeInTheDocument();
  });

  it("leaves the code dialog out when the switch is off", () => {
    harness.isEmailCodeOn = false;
    renderProvider();
    expect(screen.getByTestId("page")).toBeInTheDocument();
    expect(screen.queryByTestId("reauth-code-dialog")).not.toBeInTheDocument();
  });

  it("leaves the code dialog out while the switch is not known", () => {
    harness.isEmailCodeOn = null;
    renderProvider();
    expect(screen.queryByTestId("reauth-code-dialog")).not.toBeInTheDocument();
  });
});
