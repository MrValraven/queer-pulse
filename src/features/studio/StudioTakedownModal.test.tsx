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

// Mock release title/meta for the modal under test — content, not chrome.
const MOCK_RELEASE_TITLE = "Threshold EP";
const MOCK_RELEASE_META = "Released 2025 · 3 tracks";

function renderModal() {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(
    <TestProviders>
      <StudioTakedownModal
        title={MOCK_RELEASE_TITLE}
        meta={MOCK_RELEASE_META}
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
    fireEvent.click(
      await screen.findByRole("button", { name: /take it down/i }),
    );
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

  it("dismisses on a backdrop press-and-release but not on an inside click", async () => {
    const { onClose } = renderModal();
    const dialog = await screen.findByRole("dialog");
    const scrim = dialog.parentElement!;
    // Clicking inside the dialog must not close it.
    fireEvent.pointerDown(dialog);
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
    // The scrim closes on a press that both STARTS and ends on it
    // (`useScrimDismiss`), so a text-selection drag that happens to release
    // over the scrim doesn't dismiss the dialog under the member.
    fireEvent.pointerDown(scrim);
    fireEvent.click(scrim);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores a release on the scrim that began inside the dialog", async () => {
    const { onClose } = renderModal();
    const dialog = await screen.findByRole("dialog");
    // Press inside (selecting text), release outside: not a dismiss.
    fireEvent.pointerDown(dialog);
    fireEvent.click(dialog.parentElement!);
    expect(onClose).not.toHaveBeenCalled();
  });
});
