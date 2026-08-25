import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { VerificationSignalsPanel } from "./VerificationSignalsPanel";
import type { VerificationSignalsDTO } from "./api/adminVerifications.api";

const BASE_SIGNALS: VerificationSignalsDTO = {
  accountAgeDays: 260,
  priorRejections: 0,
  duplicateProviderRef: null,
};

/**
 * The panel's own contract, independent of the drawer that hosts it: one
 * chip per signal (account age always, prior rejections tone flips on
 * count, duplicate provider-ref only when the snapshot flags one), and a
 * short empty note instead of an empty chip row when `signals` is `null`
 * (a request from before Phase 3, or any snapshot gap). Copy is the lazy
 * `admin` catalog → `findBy*` throughout, per the repo's test-harness
 * convention.
 */
describe("VerificationSignalsPanel", () => {
  it("renders the account age chip and the neutral no-prior-rejections chip", async () => {
    render(
      <TestProviders>
        <VerificationSignalsPanel signals={BASE_SIGNALS} />
      </TestProviders>,
    );

    expect(await screen.findByText("260 days old")).toBeInTheDocument();
    expect(await screen.findByText("No prior rejections")).toBeInTheDocument();
    expect(screen.queryByText(/Shared fingerprint/)).not.toBeInTheDocument();
  });

  it("shows a warn chip with the count when there are prior rejections", async () => {
    render(
      <TestProviders>
        <VerificationSignalsPanel
          signals={{ ...BASE_SIGNALS, priorRejections: 2 }}
        />
      </TestProviders>,
    );

    expect(await screen.findByText("2 prior rejection(s)")).toBeInTheDocument();
    expect(screen.queryByText("No prior rejections")).not.toBeInTheDocument();
  });

  it("shows a titled duplicate chip with the count when duplicateProviderRef is set", async () => {
    render(
      <TestProviders>
        <VerificationSignalsPanel
          signals={{
            ...BASE_SIGNALS,
            duplicateProviderRef: { count: 3, userIds: ["a", "b", "c"] },
          }}
        />
      </TestProviders>,
    );

    const duplicateChip = await screen.findByText(
      "Shared fingerprint with 3 other account(s)",
    );
    expect(duplicateChip).toBeInTheDocument();
    expect(duplicateChip.closest("span")).toHaveAttribute(
      "title",
      "The member's identity-provider session reference is shared with at least one other account.",
    );
  });

  it("renders a short empty note instead of chips when signals is null", async () => {
    render(
      <TestProviders>
        <VerificationSignalsPanel signals={null} />
      </TestProviders>,
    );

    expect(await screen.findByText("No signals yet.")).toBeInTheDocument();
    expect(screen.queryByText("260 days old")).not.toBeInTheDocument();
  });
});
