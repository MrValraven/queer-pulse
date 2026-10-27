import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type { TryItOption } from "./audiences.data";
import { TryItSwitch } from "./TryItSwitch";

type ListingKind = "cafe" | "shop" | "studio";

const OPTIONS: readonly TryItOption<ListingKind>[] = [
  { id: "cafe", label: "Cafe" },
  { id: "shop", label: "Shop" },
  { id: "studio", label: "Studio" },
];

describe("TryItSwitch", () => {
  it("arrow keys move the selection", () => {
    const handleChange = vi.fn();
    render(
      <TestProviders>
        <TryItSwitch<ListingKind>
          label="Listing kind"
          options={OPTIONS}
          activeId="cafe"
          onChange={handleChange}
        >
          <p>Panel content</p>
        </TryItSwitch>
      </TestProviders>,
    );
    expect(
      screen.getByRole("tablist", { name: "Listing kind" }),
    ).toBeInTheDocument();
    const firstTab = screen.getByRole("tab", { name: "Cafe" });
    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: "ArrowRight" });
    expect(handleChange).toHaveBeenCalledWith("shop");
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      firstTab.id,
    );
  });
});
