import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DeleteAccountSection } from "./DeleteAccountSection";

/**
 * Step-up with no cached token. This file swaps `useReauth` for one that has
 * none and records `beginReauth`, which is what a member sees before the
 * code dialog confirms.
 */
const reauthHarness = vi.hoisted(() => ({ beginReauth: vi.fn() }));
vi.mock("./api/useAccountMutations", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/useAccountMutations")>()),
  useReauth: () => ({
    getReauthToken: () => null,
    beginReauth: reauthHarness.beginReauth,
  }),
}));

describe("DeleteAccountSection with no step-up token", () => {
  it("opens the code dialog and returns to confirm with no success panel", async () => {
    render(
      <TestProviders>
        <DeleteAccountSection />
      </TestProviders>,
    );

    fireEvent.click(await screen.findByText("Delete account"));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "delete my account" },
    });
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Permanently delete my account",
      }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete my account" }),
    );

    await waitFor(() =>
      expect(reauthHarness.beginReauth).toHaveBeenCalledTimes(1),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Delete my account" }),
      ).toBeEnabled(),
    );
    expect(screen.queryByText(/scheduled\./)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Try again" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancel deletion" }),
    ).not.toBeInTheDocument();
  });
});
