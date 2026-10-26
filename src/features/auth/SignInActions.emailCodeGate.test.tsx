import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { PlatformStatusDTO } from "../../shared/api/platformStatus.api";
import { SignInPage } from "./SignInPage";

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

function renderSignIn() {
  return render(
    <TestProviders initialEntries={["/auth/sign-in"]}>
      <SignInPage />
    </TestProviders>,
  );
}

/** The Google button is the anchor: once it reads, the namespace is in. */
async function expectGoogleButton() {
  expect(
    await screen.findByRole("button", { name: /Continue with Google/ }),
  ).toBeEnabled();
}

beforeEach(() => {
  harness.status = undefined;
});

describe("SignInActions email code switch", () => {
  it("shows the divider and the email option when emailCodeSignIn is true", async () => {
    harness.status = { emailCodeSignIn: true };
    renderSignIn();
    await expectGoogleButton();
    expect(await screen.findByText("or")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
  });

  it("hides the email option when emailCodeSignIn is false", async () => {
    harness.status = { emailCodeSignIn: false };
    renderSignIn();
    await expectGoogleButton();
    expect(screen.queryByText("or")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "Email" }),
    ).not.toBeInTheDocument();
  });

  it("hides the email option when an older backend leaves the field out", async () => {
    harness.status = { registrationOpen: true };
    renderSignIn();
    await expectGoogleButton();
    expect(
      screen.queryByRole("textbox", { name: "Email" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the email option hidden while the status loads", async () => {
    renderSignIn();
    await expectGoogleButton();
    expect(
      screen.queryByRole("textbox", { name: "Email" }),
    ).not.toBeInTheDocument();
  });
});
