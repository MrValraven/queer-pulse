import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioSellerPurchaseView } from "./api/studioPurchases.adapters";
import { StudioDeclinePurchaseDialog } from "./StudioDeclinePurchaseDialog";

const PURCHASE: StudioSellerPurchaseView = {
  id: "purchase-rui",
  status: "pending",
  item: {
    kind: "release",
    title: "Cidade dos santos",
    releaseId: "release-cidade",
    trackId: null,
    formatLabelKey: "studio:purchase.format.album",
    coverUrl: null,
    href: "/studio/album?id=release-cidade",
    isAvailable: true,
  },
  amountCents: 800,
  referenceCode: "N6CR2G",
  payerName: "R Alves",
  buyer: { name: "Rui Alves", avatarUrl: null, href: null },
  createdAt: new Date("2026-10-22T10:00:00Z"),
  decidedAt: null,
};

function renderDialog({
  isDeclining = false,
  errorMessage = null,
}: { isDeclining?: boolean; errorMessage?: string | null } = {}) {
  const onClose = vi.fn();
  const onDecline = vi.fn();
  render(
    <TestProviders>
      <StudioDeclinePurchaseDialog
        purchase={PURCHASE}
        isDeclining={isDeclining}
        errorMessage={errorMessage}
        onClose={onClose}
        onDecline={onDecline}
      />
    </TestProviders>,
  );
  return { onClose, onDecline };
}

describe("StudioDeclinePurchaseDialog", () => {
  it("offers the three reasons with I can't find the payment checked first", async () => {
    renderDialog();
    const dialog = await screen.findByRole("dialog", {
      name: "Decline this payment?",
    });
    const reasons = within(dialog).getByRole("radiogroup", {
      name: "Why are you declining?",
    });
    const radios = within(reasons).getAllByRole("radio");
    expect(radios.map((radio) => radio.textContent)).toEqual([
      "I can't find the payment",
      "The amount is different",
      "Something else",
    ]);
    expect(
      within(reasons).getByRole("radio", { name: "I can't find the payment" }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("caps the note for the buyer at 200 characters and sends it trimmed", async () => {
    const { onDecline } = renderDialog();
    const note = await screen.findByRole("textbox", {
      name: "Note for Rui Alves (optional)",
    });
    expect(note).toHaveAttribute("maxLength", "200");
    fireEvent.click(screen.getByRole("radio", { name: "Something else" }));
    fireEvent.change(note, { target: { value: "  Recebi 1 €  " } });
    fireEvent.click(screen.getByRole("button", { name: "Decline payment" }));
    expect(onDecline).toHaveBeenCalledWith({
      reason: "other",
      note: "Recebi 1 €",
    });
  });

  it("sends a blank note as null", async () => {
    const { onDecline } = renderDialog();
    fireEvent.click(
      await screen.findByRole("button", { name: "Decline payment" }),
    );
    expect(onDecline).toHaveBeenCalledWith({
      reason: "payment_not_found",
      note: null,
    });
  });

  it("closes on Keep it waiting without declining", async () => {
    const { onClose, onDecline } = renderDialog();
    fireEvent.click(
      await screen.findByRole("button", { name: "Keep it waiting" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDecline).not.toHaveBeenCalled();
  });

  it("keeps Decline payment busy while declining", async () => {
    const { onDecline } = renderDialog({ isDeclining: true });
    const confirm = await screen.findByRole("button", {
      name: "Decline payment",
    });
    expect(confirm).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Keep it waiting" }),
    ).toBeDisabled();
    fireEvent.click(confirm);
    expect(onDecline).not.toHaveBeenCalled();
  });

  it("names a failed decline inside the dialog", async () => {
    renderDialog({
      errorMessage:
        "We couldn't decline this payment. You're offline. Check your connection and try again",
    });
    const dialog = await screen.findByRole("dialog", {
      name: "Decline this payment?",
    });
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "We couldn't decline this payment. You're offline",
    );
  });

  it("shows no alert while nothing failed", async () => {
    renderDialog();
    const dialog = await screen.findByRole("dialog", {
      name: "Decline this payment?",
    });
    expect(within(dialog).queryByRole("alert")).toBeNull();
  });
});
