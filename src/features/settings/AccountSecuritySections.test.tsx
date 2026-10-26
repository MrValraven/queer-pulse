import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  NotYetAvailableSection,
  SignInMethodRow,
} from "./AccountSecuritySections";

const harness = vi.hoisted<{
  hasGoogle: boolean;
  isEmailCodeOn: boolean | null;
}>(() => ({ hasGoogle: false, isEmailCodeOn: true }));

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

const GOOGLE_ONLY_NOTE =
  "Google is the only way into your account right now, so there is no password to change here. Keep your Google account itself well protected.";

function sentenceOf(element: HTMLElement) {
  return element.textContent?.replace(/\s+/g, " ").trim();
}

describe("AccountSecuritySections", () => {
  beforeEach(() => {
    harness.hasGoogle = false;
    harness.isEmailCodeOn = true;
  });

  it("says the member signs in with a code to their address", async () => {
    render(
      <TestProviders>
        <SignInMethodRow />
      </TestProviders>,
    );
    const value = await screen.findByText(/You sign in with a code sent to/);
    expect(sentenceOf(value)).toBe(
      "You sign in with a code sent to sam@example.com.",
    );
  });

  it("adds Google when the account has it", async () => {
    harness.hasGoogle = true;
    render(
      <TestProviders>
        <SignInMethodRow />
      </TestProviders>,
    );
    const value = await screen.findByText(/You sign in with a code sent to/);
    expect(sentenceOf(value)).toBe(
      "You sign in with a code sent to sam@example.com, and with Google.",
    );
  });

  it("says Google alone when codes are switched off and the account has Google", async () => {
    harness.hasGoogle = true;
    harness.isEmailCodeOn = false;
    render(
      <TestProviders>
        <SignInMethodRow />
      </TestProviders>,
    );
    const value = await screen.findByText(/You sign in with Google/);
    expect(sentenceOf(value)).toBe(
      "You sign in with Google, as sam@example.com.",
    );
    expect(screen.getByText(GOOGLE_ONLY_NOTE)).toBeInTheDocument();
    expect(screen.queryByText(/read that inbox/)).not.toBeInTheDocument();
  });

  it("says Google alone for a Google member while the switch is not known", async () => {
    harness.hasGoogle = true;
    harness.isEmailCodeOn = null;
    render(
      <TestProviders>
        <SignInMethodRow />
      </TestProviders>,
    );
    const value = await screen.findByText(/You sign in with Google/);
    expect(sentenceOf(value)).toBe(
      "You sign in with Google, as sam@example.com.",
    );
    expect(screen.getByText(GOOGLE_ONLY_NOTE)).toBeInTheDocument();
  });

  it("keeps the code line for a member without Google while the switch is not known", async () => {
    harness.isEmailCodeOn = null;
    render(
      <TestProviders>
        <SignInMethodRow />
      </TestProviders>,
    );
    const value = await screen.findByText(/You sign in with a code sent to/);
    expect(sentenceOf(value)).toBe(
      "You sign in with a code sent to sam@example.com.",
    );
  });

  it("keeps the code line when codes are switched off and the account has no Google", async () => {
    harness.isEmailCodeOn = false;
    render(
      <TestProviders>
        <SignInMethodRow />
      </TestProviders>,
    );
    const value = await screen.findByText(/You sign in with a code sent to/);
    expect(sentenceOf(value)).toBe(
      "You sign in with a code sent to sam@example.com.",
    );
  });

  it("drops the second-way-in line from Not available yet", async () => {
    render(
      <TestProviders>
        <NotYetAvailableSection />
      </TestProviders>,
    );
    await screen.findAllByRole("listitem");
    expect(screen.queryByText(/A second way in/)).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});
