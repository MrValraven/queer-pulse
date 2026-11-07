import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { StudioTipModal } from "./StudioTipModal";

/**
 * The tip modal owns real client-side logic worth locking down (studio is
 * demo-only in live, so there's no adapter — just interaction): the send button
 * is gated on a positive amount, the chosen amount flows into the CTA label, and
 * the send flow transitions through a "sending" beat into the plum thank-you
 * panel. Driven through `TestProviders` (real scroll-lock + i18n), no mocks.
 * The number input exposes a stable `spinbutton` role; the button label + the
 * success copy come from the lazy `studio` catalog, so those use `findBy*`.
 */

describe("StudioTipModal", () => {
  it("gates the send button on a positive amount", async () => {
    render(
      <TestProviders>
        <StudioTipModal recipient="Mariana Sol" onClose={() => {}} />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    // Default preset (€2) leaves the send button enabled.
    expect(await screen.findByRole("button", { name: /^tip /i })).toBeEnabled();

    const customInput = screen.getByRole("spinbutton");
    fireEvent.change(customInput, { target: { value: "0" } });
    expect(screen.getByRole("button", { name: /^tip /i })).toBeDisabled();

    fireEvent.change(customInput, { target: { value: "5" } });
    expect(screen.getByRole("button", { name: /^tip /i })).toBeEnabled();
  });

  it("reflects a custom amount in the send CTA", async () => {
    render(
      <TestProviders>
        <StudioTipModal recipient="Mariana Sol" onClose={() => {}} />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    // Resolve the catalog first so the CTA label is real copy, not a key.
    await screen.findByRole("button", { name: /^tip /i });
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "25" },
    });
    expect(
      await screen.findByRole("button", { name: /25/ }),
    ).toBeInTheDocument();
  });

  it("sends a tip and lands on the plum thank-you panel", async () => {
    render(
      <TestProviders>
        <StudioTipModal recipient="Mariana Sol" onClose={() => {}} />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    fireEvent.click(await screen.findByRole("button", { name: /^tip /i }));
    // The send flow runs a ~1.1s "sending" beat before the success panel;
    // allow extra time for that real timer.
    expect(
      await screen.findByText("Back to the music", {}, { timeout: 2500 }),
    ).toBeInTheDocument();
  });

  it("marks the picked preset pressed", async () => {
    render(
      <TestProviders>
        <StudioTipModal recipient="Mariana Sol" onClose={() => {}} />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    const fivePreset = await screen.findByRole("button", { name: "€5" });
    expect(fivePreset).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(fivePreset);
    expect(fivePreset).toHaveAttribute("aria-pressed", "true");
  });

  it("names the reason when the demo card issuer declines a large tip", async () => {
    render(
      <TestProviders>
        <StudioTipModal recipient="Mariana Sol" onClose={() => {}} />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    await screen.findByRole("button", { name: /^tip /i });
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "150" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^tip /i }));
    // The toast deck keeps an empty alert region outside the dialog.
    expect(
      await within(screen.getByRole("dialog")).findByRole(
        "alert",
        {},
        { timeout: 2500 },
      ),
    ).toHaveTextContent(/declined/i);
  });
});
