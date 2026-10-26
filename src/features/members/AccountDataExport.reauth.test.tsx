import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AccountDataExport } from "./AccountDataExport";

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

describe("AccountDataExport with no step-up token", () => {
  it("opens the code dialog and leaves Request export enabled with no toast", async () => {
    render(
      <TestProviders>
        <AccountDataExport />
      </TestProviders>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /Request export/ }),
    );

    await waitFor(() =>
      expect(reauthHarness.beginReauth).toHaveBeenCalledTimes(1),
    );
    expect(
      screen.getByRole("button", { name: /Request export/ }),
    ).toBeEnabled();
    expect(screen.queryByText("Requesting…")).not.toBeInTheDocument();
    expect(
      screen.queryByText("We couldn't start your export. Please try again."),
    ).not.toBeInTheDocument();
  });
});
