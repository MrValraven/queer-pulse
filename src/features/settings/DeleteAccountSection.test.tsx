import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
    // scheduled, still-cancellable erasure (GDPR Art. 17 grace period).
    // Demo's step-up token resolves synchronously (getReauthToken(), no
    // network round trip to simulate); deletion-request itself still carries
    // a ~900ms simulated delay (account.api simulateOr) — past findBy's
    // default 1s budget under CI jitter. Widen the window rather than
    // shorten the assertion.
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

  it("offers a real way into notification settings, never a control that saves nothing", async () => {
    render(
      <TestProviders>
        <DeleteAccountSection />
      </TestProviders>,
    );

    // The gentler alternative to deleting is a link into the Notifications
    // pane, where per-category switches and quiet hours genuinely exist. It
    // replaced a decorative button offering a 30-day bulk pause of "all emails
    // and digests" that no endpoint has ever backed.
    const link = await screen.findByRole("link", {
      name: /Choose your notifications/,
    });
    expect(link).toHaveAttribute(
      "href",
      "/account/settings?pane=notifications",
    );

    // Nothing in this strip advertises a build that does not exist.
    expect(screen.queryByText(/Coming soon/i)).not.toBeInTheDocument();
  });

  it("switches panes in place when it renders inside Settings", async () => {
    // SettingsPage reads `?pane=` once, in a useState initializer, so a link
    // would move the URL and leave the pane put. It passes a callback instead.
    const onOpenNotificationSettings = vi.fn();
    render(
      <TestProviders>
        <DeleteAccountSection
          onOpenNotificationSettings={onOpenNotificationSettings}
        />
      </TestProviders>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /Choose your notifications/ }),
    );
    expect(onOpenNotificationSettings).toHaveBeenCalledTimes(1);
  });
});
