import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DeleteAccountSection } from "./DeleteAccountSection";

/**
 * Account deletion / GDPR erasure (audit item #13).
 *
 * Runs in DEMO mode (forced on by the empty VITE_API_URL in vitest.config), so
 * the step-up re-auth + deletion mutations are simulated in-process — no MSW
 * needed. The behaviour under test is mode-independent: the typed-phrase gate
 * is a real, checked client-side gate (see `deleteAccount.data.tsx`), and a
 * confirmed delete schedules a cancellable erasure.
 *
 * i18n note: `settings` is a lazy namespace, so translated labels resolve one
 * render after mount — findBy* is used for the first lookup of each string.
 */
describe("DeleteAccountSection", () => {
  it("gates the destructive action behind an exact typed confirmation", async () => {
    render(
      <TestProviders>
        <DeleteAccountSection />
      </TestProviders>,
    );

    // Default option is "deactivate"; its submit button resolves once the
    // settings namespace has loaded.
    const submit = await screen.findByRole("button", {
      name: "Deactivate my account",
    });
    // Empty phrase → the gate is closed.
    expect(submit).toBeDisabled();

    const confirmInput = screen.getByRole("textbox");

    // A near-miss must not open the gate.
    fireEvent.change(confirmInput, {
      target: { value: "deactivate my accoun" },
    });
    expect(submit).toBeDisabled();

    // The exact confirmation phrase enables the action.
    fireEvent.change(confirmInput, {
      target: { value: "deactivate my account" },
    });
    expect(submit).toBeEnabled();
  });

  it("schedules a cancellable erasure after confirming the delete flow", async () => {
    render(
      <TestProviders>
        <DeleteAccountSection />
      </TestProviders>,
    );

    // Switch to the irreversible "Delete account" off-ramp (its card is a
    // role=button; clicking its title bubbles to the card handler).
    fireEvent.click(await screen.findByText("Delete account"));

    // Type the delete-specific confirmation phrase, then submit the form.
    const confirmInput = screen.getByRole("textbox");
    fireEvent.change(confirmInput, { target: { value: "delete my account" } });
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Permanently delete my account",
      }),
    );

    // The shared confirm → loading → result dialog opens (portalled to <body>).
    // Confirm the deletion inside it.
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete my account" }),
    );

    // The mutation resolves and the section flips to the pending state: a
    // scheduled, still-cancellable erasure (GDPR Art. 17 grace period). The
    // demo re-auth + deletion-request each carry a ~900ms simulated delay
    // (account.api simulateOr), so the flip lands ~1.8s out — past findBy's
    // default 1s budget. Widen the window rather than shorten the assertion.
    expect(
      await screen.findByRole(
        "button",
        { name: "Cancel deletion" },
        { timeout: 4000 },
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Permanently delete my account" }),
      ).not.toBeInTheDocument(),
    );
  });
});
