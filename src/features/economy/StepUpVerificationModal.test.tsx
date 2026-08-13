import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StepUpVerificationModal } from "./StepUpVerificationModal";

/**
 * The step-up modal used to walk a member through an automated phone-OTP /
 * identity-redirect flow. Phase 2 repurposes it into a submit-a-request flow
 * (member picks a target level, writes a short context note, submits — a
 * moderator decides later), so these tests lock down the request lifecycle
 * instead: the form renders with the right level choices, submitting drives
 * the demo-mode `useSubmitVerificationRequest` mutation and flips the view to
 * a submitted-status panel echoing what was sent, and withdraw reopens the
 * form. Driven through `TestProviders` (demo mode is forced on, so every
 * `useVerification` hook resolves against the colocated fixture with no
 * network) — no mocks needed. Copy comes from the lazy `economy` catalog, so
 * assertions use `findBy*` for the first paint.
 */

describe("StepUpVerificationModal", () => {
  it("renders the request form with a level picker when gated at phone", async () => {
    render(
      <TestProviders>
        <StepUpVerificationModal
          requiredLevel="phone"
          onVerified={() => {}}
          onClose={() => {}}
        />
      </TestProviders>,
    );

    expect(
      await screen.findByRole("textbox", { name: /tell us a bit/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /send request/i }),
    ).toBeInTheDocument();
  });

  it("offers no level choice when already gated at the top level", async () => {
    render(
      <TestProviders>
        <StepUpVerificationModal
          requiredLevel="id_verified"
          onVerified={() => {}}
          onClose={() => {}}
        />
      </TestProviders>,
    );

    await screen.findByRole("button", { name: /send request/i });
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("submits the chosen level + context and shows the submitted status", async () => {
    render(
      <TestProviders>
        <StepUpVerificationModal
          requiredLevel="phone"
          onVerified={() => {}}
          onClose={() => {}}
        />
      </TestProviders>,
    );

    const contextField = await screen.findByRole("textbox", {
      name: /tell us a bit/i,
    });
    fireEvent.change(contextField, {
      target: { value: "I host the monthly potluck, ask Sofia." },
    });
    fireEvent.click(screen.getByRole("button", { name: /send request/i }));

    expect(await screen.findByText("Submitted")).toBeInTheDocument();
    expect(
      screen.getByText("I host the monthly potluck, ask Sofia."),
    ).toBeInTheDocument();
    // The requested-level badge echoes the pre-selected radio option.
    expect(screen.getByText("Phone-verified")).toBeInTheDocument();
  });

  it("withdraws a pending request and returns to the form", async () => {
    render(
      <TestProviders>
        <StepUpVerificationModal
          requiredLevel="phone"
          onVerified={() => {}}
          onClose={() => {}}
        />
      </TestProviders>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /send request/i }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /withdraw request/i }),
    );

    expect(
      await screen.findByRole("textbox", { name: /tell us a bit/i }),
    ).toBeInTheDocument();
  });
});
