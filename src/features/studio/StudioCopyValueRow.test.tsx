import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioCopyValueRow } from "./StudioCopyValueRow";

const REFERENCE = "QP7K3F";

function mockClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

function renderRow() {
  render(
    <TestProviders>
      <StudioCopyValueRow
        label="Payment reference"
        value={REFERENCE}
        copyLabel="Copy reference"
        copyAriaLabel="Copy reference for the payment"
        copiedToast="Reference copied"
        copyFailedToast="Could not copy the reference. Select it and copy it yourself"
      />
    </TestProviders>,
  );
}

describe("StudioCopyValueRow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the label and the value without translation", () => {
    mockClipboard(vi.fn().mockResolvedValue(undefined));
    renderRow();

    expect(screen.getByText("Payment reference")).toBeInTheDocument();
    expect(screen.getByText(REFERENCE)).toHaveAttribute("translate", "no");
  });

  it("names the button by the aria label and keeps the visible text inside it", () => {
    mockClipboard(vi.fn().mockResolvedValue(undefined));
    renderRow();

    const button = screen.getByRole("button", {
      name: "Copy reference for the payment",
    });
    expect(button).toHaveTextContent("Copy reference");
    expect(button.getAttribute("aria-label")).toContain("Copy reference");
    // The value stays out of the accessible name.
    expect(button.getAttribute("aria-label")).not.toContain(REFERENCE);
  });

  it("copies the value and confirms it with a toast", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    renderRow();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Copy reference for the payment",
      }),
    );

    expect(await screen.findByText("Reference copied")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(REFERENCE);
  });

  it("says so when the clipboard refuses and leaves the value selectable", async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    renderRow();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Copy reference for the payment",
      }),
    );

    expect(
      await screen.findByText(
        "Could not copy the reference. Select it and copy it yourself",
      ),
    ).toBeInTheDocument();
    // The value stays on screen as plain text, ready to select.
    expect(screen.getByText(REFERENCE)).toBeVisible();
  });
});
