import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AccountDataStepAway } from "./AccountDataStepAway";

/**
 * Step-up with no cached token. This file swaps `useReauth` for one that has
 * none and records `beginReauth`, which is what a member sees before the
 * code dialog confirms.
 */
const reauthHarness = vi.hoisted(() => ({ beginReauth: vi.fn() }));
vi.mock("../settings/api/useAccountMutations", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../settings/api/useAccountMutations")
  >()),
  useReauth: () => ({
    getReauthToken: () => null,
    beginReauth: reauthHarness.beginReauth,
  }),
}));

describe("AccountDataStepAway with no step-up token", () => {
  it("closes the confirm dialog, opens the code dialog and shows no error", async () => {
    render(
      <TestProviders>
        <AccountDataStepAway ownerSlug="demo-member" />
      </TestProviders>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Hide me" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Yes, hide me" }),
    );

    await waitFor(() =>
      expect(reauthHarness.beginReauth).toHaveBeenCalledTimes(1),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Yes, hide me" }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Hide me" })).toBeEnabled();
    expect(
      screen.queryByText("Something went wrong. Please try again."),
    ).not.toBeInTheDocument();
  });
});
