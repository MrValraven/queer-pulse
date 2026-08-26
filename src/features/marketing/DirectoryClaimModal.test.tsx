import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DirectoryClaimModal } from "./DirectoryClaimModal";

/**
 * Demo mode, which is what `TestProviders` runs in (the empty `VITE_API_URL`
 * in vitest.config forces it on).
 *
 * A demo claim resolves in the browser and is never stored, and both
 * `useMyListingClaims` and `useListingClaimPolicy` are disabled there, so the
 * confirmation must not offer a claims page that would answer it with "you
 * haven't claimed a listing yet". `DirectoryAsideOwner` guards the same
 * destination the same way.
 */
describe("DirectoryClaimModal in demo mode", () => {
  it("confirms the claim without offering a claims page that would be empty", async () => {
    render(
      <TestProviders>
        <DirectoryClaimModal
          listingRef="QPL-2026-0007"
          placeName="Casa Bica"
          onClose={() => {}}
        />
      </TestProviders>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /send to moderators/i }),
    );

    // The demo mutation resolves after a short simulated delay.
    expect(
      await screen.findByRole("button", { name: /done/i }, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /see the claims you've filed/i }),
    ).not.toBeInTheDocument();
  });

  it("shows no turnaround or evidence hints, because the policy is server-owned", () => {
    render(
      <TestProviders>
        <DirectoryClaimModal
          listingRef="QPL-2026-0007"
          placeName="Casa Bica"
          onClose={() => {}}
        />
      </TestProviders>,
    );

    // `useListingClaimPolicy` never reaches the network in demo, so the block
    // hides rather than quoting a number this build cannot stand behind.
    expect(
      screen.queryByText(/What helps, and how long it takes/i),
    ).not.toBeInTheDocument();
  });
});
