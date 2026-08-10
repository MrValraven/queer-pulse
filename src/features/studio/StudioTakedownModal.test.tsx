import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioTakedownModal } from "./StudioTakedownModal";

/**
 * The confirm-takedown dialog is a self-contained overlay (studio is demo-only
 * in live, so there's no adapter to test — just the interaction contract). It
 * must hand control back cleanly on all four dismissal paths: the confirm
 * action, the cancel action, Escape, and a backdrop click — while an inside
 * click must NOT close it. All observable through the `onConfirm`/`onClose`
 * spies; `role="dialog"` is static, button copy comes from the lazy `studio`
 * catalog so those queries use `findBy*`.
 */

function renderModal() {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(
    <TestProviders>
      <StudioTakedownModal
        title="Threshold EP"
        meta="Released 2025 · 3 tracks"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    </TestProviders>,
  );
  return { onConfirm, onClose };
}

describe("StudioTakedownModal", () => {
  it("confirms the takedown via the primary action", async () => {
    const { onConfirm, onClose } = renderModal();
    fireEvent.click(await screen.findByRole("button", { name: /take it down/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("dismisses via the cancel action", async () => {
    const { onConfirm, onClose } = renderModal();
    fireEvent.click(await screen.findByRole("button", { name: /keep it up/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("dismisses on Escape", async () => {
    const { onClose } = renderModal();
    // Wait for the catalog so the dialog is fully mounted, then press Escape.
    await screen.findByRole("button", { name: /take it down/i });
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("dismisses on a backdrop click but not on an inside click", async () => {
    const { onClose } = renderModal();
    const dialog = await screen.findByRole("dialog");
    // Clicking inside the dialog must not close it.
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
    // Clicking the backdrop (the dialog's overlay parent) closes it.
    fireEvent.click(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
