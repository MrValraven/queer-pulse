import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SelectOption } from "./Select";
import { SelectPanel } from "./SelectPanel";

/**
 * Contract: SelectPanel focuses its search field on open for a mouse or
 * keyboard, and its listbox on a touch screen so the on-screen keyboard only
 * rises once the person taps the field.
 */
const FRUITS: SelectOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
];

function stubPointer(isCoarse: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: isCoarse && query.includes("pointer: coarse"),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

function renderPanel() {
  return render(
    <SelectPanel
      baseId="fruit"
      listboxId="fruit-list"
      options={FRUITS}
      selected={new Set()}
      multiple={false}
      searchable
      loading={false}
      emptyText="No fruit"
      searchPlaceholder="Filter fruit"
      loadingText="Loading"
      listboxLabel="Fruit"
      onSelect={() => {}}
      onClose={() => {}}
    />,
  );
}

describe("SelectPanel initial focus", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("focuses the search field on open for a mouse or keyboard", () => {
    stubPointer(false);
    renderPanel();

    expect(
      screen.getByRole("combobox", { name: "Filter fruit" }),
    ).toHaveFocus();
  });

  it("focuses the list on open on a touch screen", () => {
    stubPointer(true);
    renderPanel();

    expect(screen.getByRole("listbox", { name: "Fruit" })).toHaveFocus();
    expect(
      screen.getByRole("combobox", { name: "Filter fruit" }),
    ).not.toHaveFocus();
  });
});
