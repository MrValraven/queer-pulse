import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { FormField } from "./FormField";
import { Select, type SelectOption } from "./Select";

/**
 * Contract: one primitive replaces the app's native `<select>`s with a
 * searchable, keyboard-navigable, single-or-multi dropdown. These cover the
 * behaviours a native select can't (typeahead, multi) plus the ones it must not
 * regress (label wiring, listbox/option roles, focus return). Strings are passed
 * explicitly so assertions don't depend on the lazily-loaded i18n catalogs.
 */
const FRUITS: SelectOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date", keywords: "medjool" },
];

function SingleHarness({
  onChange,
  searchable,
  clearable,
  initial = null,
}: {
  onChange?: (value: string | null) => void;
  searchable?: boolean;
  clearable?: boolean;
  initial?: string | null;
}) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <Select
      label="Fruit"
      placeholder="Pick a fruit"
      searchPlaceholder="Filter fruit"
      options={FRUITS}
      searchable={searchable}
      clearable={clearable}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

function MultiHarness({ onChange }: { onChange?: (value: string[]) => void }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Select
      multiple
      label="Fruit"
      placeholder="Pick fruit"
      options={FRUITS}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: TestProviders });
}

describe("Select", () => {
  it("labels the trigger and opens the listbox on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SingleHarness />);

    const trigger = screen.getByRole("button", { name: "Fruit" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      within(screen.getByRole("listbox")).getAllByRole("option"),
    ).toHaveLength(FRUITS.length);
  });

  it("selects a single option and closes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<SingleHarness onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Fruit" }));
    await user.click(screen.getByRole("option", { name: "Banana" }));

    expect(onChange).toHaveBeenCalledWith("banana");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    // The chosen label now shows on the trigger.
    expect(
      screen.getByRole("button", { name: /Fruit|Banana/ }),
    ).toHaveTextContent("Banana");
  });

  it("filters options via the typeahead", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SingleHarness searchable />);

    await user.click(screen.getByRole("button", { name: "Fruit" }));
    await user.type(screen.getByRole("combobox"), "ban");

    expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Apple" }),
    ).not.toBeInTheDocument();
  });

  it("matches on keywords, not just the visible label", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SingleHarness searchable />);

    await user.click(screen.getByRole("button", { name: "Fruit" }));
    await user.type(screen.getByRole("combobox"), "medjool");

    expect(screen.getByRole("option", { name: "Date" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Apple" }),
    ).not.toBeInTheDocument();
  });

  it("navigates with the arrow keys and selects with Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<SingleHarness searchable onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Fruit" }));
    // Active starts on the first option; one step down lands on Banana.
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledWith("banana");
  });

  it("toggles several values in multi-select and stays open", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<MultiHarness onChange={onChange} />);

    // The trigger is named by its LABEL, not by the placeholder it happens to
    // be showing: `aria-label` overrides the text content for the accessible
    // name, so the control keeps one stable name as its value changes.
    await user.click(screen.getByRole("button", { name: "Fruit" }));
    const listbox = screen.getByRole("listbox");
    await user.click(within(listbox).getByRole("option", { name: "Apple" }));
    await user.click(within(listbox).getByRole("option", { name: "Cherry" }));

    expect(onChange).toHaveBeenLastCalledWith(["apple", "cherry"]);
    // Multi-select never auto-closes.
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(
      within(listbox).getByRole("option", { name: "Apple" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SingleHarness searchable />);

    const trigger = screen.getByRole("button", { name: "Fruit" });
    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("clears a single selection via the inline clear button", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <SingleHarness clearable initial="banana" onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("is wired by FormField: label targets the trigger, error marks it invalid", () => {
    renderWithProviders(
      <FormField label="City" helper="Where you're based" error="Required">
        <Select options={FRUITS} value={null} onChange={() => {}} />
      </FormField>,
    );
    const trigger = screen.getByRole("button");
    // FormField minted an id, put it on the trigger, and pointed its <label> at it.
    expect(trigger.id).toBeTruthy();
    expect(document.querySelector("label")).toHaveAttribute("for", trigger.id);
    // The helper + error reach the trigger's accessible description.
    expect(trigger).toHaveAccessibleDescription(/Where you're based Required/);
  });
});
