import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { CommunityGivingMethodDTO } from "../api/communityGiving.api";
import { GivingCopyRow } from "./GivingCopyRow";

const COMPACT_IBAN = "PT50000201231234567890154";
const GROUPED_IBAN = "PT50 0002 0123 1234 5678 9015 4";

const IBAN_METHOD: CommunityGivingMethodDTO = {
  id: "giving-test-iban",
  kind: "iban",
  label: null,
  value: COMPACT_IBAN,
  note: null,
  position: 0,
};

function mockClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

function renderIbanRow() {
  render(
    <TestProviders>
      <GivingCopyRow method={IBAN_METHOD} />
    </TestProviders>,
  );
}

describe("GivingCopyRow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("copies the compact IBAN and confirms it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    renderIbanRow();

    fireEvent.click(screen.getByRole("button", { name: "Copy IBAN for IBAN" }));

    expect(await screen.findByText("IBAN copied")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(COMPACT_IBAN);
    // The toast is the only announcement: the button keeps its name.
    expect(
      screen.getByRole("button", { name: "Copy IBAN for IBAN" }),
    ).toHaveAttribute("data-copied", "true");
  });

  it("says so when the clipboard refuses and keeps the value on screen", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    mockClipboard(writeText);
    renderIbanRow();

    fireEvent.click(screen.getByRole("button", { name: "Copy IBAN for IBAN" }));

    expect(
      await screen.findByText(
        "Couldn't copy. Select the text and copy it yourself.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(GROUPED_IBAN)).toBeInTheDocument();
  });

  it("renders a method that carries only kind, label and value", () => {
    mockClipboard(vi.fn().mockResolvedValue(undefined));
    render(
      <TestProviders>
        <GivingCopyRow
          method={{ kind: "iban", label: null, value: COMPACT_IBAN }}
        />
      </TestProviders>,
    );

    expect(screen.getByText(GROUPED_IBAN)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy IBAN for IBAN" }),
    ).toBeInTheDocument();
  });
});
