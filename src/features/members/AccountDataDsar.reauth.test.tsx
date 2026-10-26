import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ReauthRequiredError } from "../settings/api/reauthRequiredError";
import { AccountDataDsar } from "./AccountDataDsar";

/**
 * The submit hook stops with `ReauthRequiredError` when no step-up token is
 * cached (it has just opened the code dialog). The sheet must settle quietly.
 */
const harness = vi.hoisted(() => ({ submitDsar: vi.fn() }));
vi.mock("../settings/api/useDsar", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../settings/api/useDsar")>()),
  useSubmitDsar: () => harness.submitDsar,
}));

describe("AccountDataDsar with no step-up token", () => {
  it("re-enables Send request with no toast after the code dialog opens", async () => {
    harness.submitDsar.mockRejectedValue(new ReauthRequiredError());
    render(
      <TestProviders>
        <AccountDataDsar />
      </TestProviders>,
    );

    fireEvent.change(await screen.findByLabelText("What do you need?"), {
      target: { value: "A copy of my data" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send request" }));

    await waitFor(() => expect(harness.submitDsar).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Send request" }),
      ).toBeEnabled(),
    );
    expect(
      screen.queryByText("We couldn't send that request. Please try again."),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("What do you need?")).toHaveValue(
      "A copy of my data",
    );
  });
});
