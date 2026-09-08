import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SharedValuesPickerModal } from "./SharedValuesPickerModal";
import {
  MAX_COMMUNITY_RULES,
  SHARED_VALUE_LIBRARY,
} from "./startCommunity/sharedValueLibrary.data";

/** English copy for a library entry, as the picker renders it. */
const LABEL = {
  transWelcome:
    "Trans and non-binary people are welcome here without question.",
  noPileOn: "One person handles a problem. We do not pile on.",
  softDrinksGood:
    "There is always something good to drink that is not alcohol.",
} as const;

type PickerProps = Parameters<typeof SharedValuesPickerModal>[0];
type ApplyChange = Parameters<PickerProps["onApply"]>[0];

function renderPicker(props: Partial<PickerProps> = {}) {
  const onApply = vi.fn<(change: ApplyChange) => void>();
  const onClose = vi.fn();
  render(
    <TestProviders>
      <SharedValuesPickerModal
        selectedIds={[]}
        customCount={0}
        onApply={onApply}
        onClose={onClose}
        {...props}
      />
    </TestProviders>,
  );
  return { onApply, onClose };
}

const dialog = () => screen.getByRole("dialog");

describe("SharedValuesPickerModal", () => {
  it("offers the whole library, grouped under its themes", async () => {
    renderPicker();

    expect(
      await screen.findByRole("button", { name: LABEL.transWelcome }),
    ).toBeInTheDocument();
    expect(
      within(dialog()).getAllByRole("button", { pressed: false }).length,
    ).toBe(SHARED_VALUE_LIBRARY.length);
    expect(
      within(dialog()).getByRole("heading", { name: "Conflict and repair" }),
    ).toBeInTheDocument();
  });

  it("narrows to matching values as you search", async () => {
    const user = userEvent.setup();
    renderPicker();

    await user.type(
      await screen.findByRole("searchbox", { name: "Search shared values" }),
      "pile on",
    );

    expect(
      within(dialog()).getAllByRole("button", { pressed: false }),
    ).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: LABEL.noPileOn }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Safety and respect" }),
    ).not.toBeInTheDocument();
  });

  it("shows the values already held as ticked", async () => {
    renderPicker({ selectedIds: ["transWelcome"] });

    expect(
      await screen.findByRole("button", {
        name: LABEL.transWelcome,
        pressed: true,
      }),
    ).toBeInTheDocument();
  });

  it("reports ticks as additions and unticks as removals, once", async () => {
    const user = userEvent.setup();
    const { onApply, onClose } = renderPicker({
      selectedIds: ["transWelcome"],
    });

    await user.click(
      await screen.findByRole("button", { name: LABEL.transWelcome }),
    );
    await user.click(screen.getByRole("button", { name: LABEL.noPileOn }));
    // Nothing has left the picker yet: selection is staged until confirm.
    expect(onApply).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Use these values" }));

    expect(onApply).toHaveBeenCalledTimes(1);
    const { added, removed } = onApply.mock.calls[0]![0];
    expect(added.map((entry) => entry.id)).toEqual(["noPileOn"]);
    expect(removed.map((entry) => entry.id)).toEqual(["transWelcome"]);
    expect(onClose).toHaveBeenCalled();
  });

  it("counts the owner's own values against the ceiling and stops there", async () => {
    const user = userEvent.setup();
    const { onApply } = renderPicker({
      customCount: MAX_COMMUNITY_RULES - 1,
      selectedIds: ["transWelcome"],
    });

    // One custom short of the cap plus one library value already held leaves
    // no room: an unticked value cannot be added.
    const unticked = await screen.findByRole("button", {
      name: LABEL.softDrinksGood,
    });
    expect(unticked).toBeDisabled();

    // The held one still unticks, or an owner could trap themselves at the cap.
    await user.click(screen.getByRole("button", { name: LABEL.transWelcome }));
    await user.click(screen.getByRole("button", { name: "Use these values" }));
    expect(onApply.mock.calls[0]![0].removed).toHaveLength(1);
  });
});
