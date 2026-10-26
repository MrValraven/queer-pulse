import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ReauthRequiredError } from "../settings/api/reauthRequiredError";
import { DsarPage } from "./DsarPage";

/**
 * The submit hook stops with `ReauthRequiredError` when no step-up token is
 * cached (it has just opened the code dialog). The form must settle quietly.
 */
const harness = vi.hoisted(() => ({ submitDsar: vi.fn() }));
vi.mock("../settings/api/useDsar", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../settings/api/useDsar")>()),
  useSubmitDsar: () => harness.submitDsar,
}));

describe("DsarPage with no step-up token", () => {
  it("re-enables Submit request with no toast after the code dialog opens", async () => {
    harness.submitDsar.mockRejectedValue(new ReauthRequiredError());
    render(
      <TestProviders>
        <DsarPage />
      </TestProviders>,
    );

    fireEvent.change(await screen.findByLabelText("What needs to change?"), {
      target: { value: "Correct my pronouns" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit request" }));

    await waitFor(() => expect(harness.submitDsar).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Submit request" }),
      ).toBeEnabled(),
    );
    expect(
      screen.queryByText(
        "We couldn't record that request. Nothing was sent. Mind trying again?",
      ),
    ).not.toBeInTheDocument();
  });
});
