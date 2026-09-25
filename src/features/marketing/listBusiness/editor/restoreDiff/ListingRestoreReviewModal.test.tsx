import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../../test/TestProviders";
import type { ListingDraft } from "../../listBusiness.data";
import type { RestorableEditDraft } from "../useListingEditorAutosave";
import { ListingRestoreReviewModal } from "./ListingRestoreReviewModal";
import type { RestoreAreaKey, RestoreDiffArea } from "./restoreDiff.types";

/**
 * The review's own logic: one card per area, every area ticked to start, the
 * confirm label following the ticks, confirm handing back exactly the ticked
 * keys, and the empty state offering to throw the copy away. The copy comes
 * from the lazy `marketing` catalog, so the first lookup of each test awaits
 * it with `findBy*`.
 */

const RESTORABLE: RestorableEditDraft = {
  // The modal only reads `savedAt` and `hasServerChanged`; the draft itself
  // is diffed by the caller before the modal ever sees it.
  draft: {} as ListingDraft,
  savedAt: Date.now() - 5 * 60 * 1000,
  hasServerChanged: false,
};

const AREAS: RestoreDiffArea[] = [
  {
    key: "basics",
    labelKey: "marketing:listBusiness.wizard.pill.basics",
    changeCount: 1,
    fields: [
      {
        kind: "text",
        key: "name",
        labelKey: "marketing:listBusiness.wizard.pill.basics",
        segments: [
          { kind: "same", text: "Casa " },
          { kind: "removed", text: "Bica" },
          { kind: "added", text: "Rosa" },
        ],
      },
    ],
  },
  {
    key: "story",
    labelKey: "marketing:listBusiness.wizard.pill.story",
    changeCount: 2,
    fields: [
      {
        kind: "choice",
        key: "tagline",
        labelKey: "marketing:listBusiness.wizard.pill.story",
        before: "",
        after: "Coffee and books",
      },
      {
        kind: "set",
        key: "cats",
        labelKey: "marketing:listBusiness.wizard.pill.story",
        added: ["Bookshop"],
        removed: ["Bar"],
      },
    ],
  },
];

function renderModal({
  areas = AREAS,
  onConfirm = vi.fn(),
  onDiscard = vi.fn(),
  onClose = vi.fn(),
}: {
  areas?: RestoreDiffArea[];
  onConfirm?: (areaKeys: ReadonlySet<RestoreAreaKey>) => void;
  onDiscard?: () => void;
  onClose?: () => void;
} = {}) {
  render(
    <TestProviders>
      <ListingRestoreReviewModal
        areas={areas}
        restorable={RESTORABLE}
        onConfirm={onConfirm}
        onDiscard={onDiscard}
        onClose={onClose}
      />
    </TestProviders>,
  );
  return { onConfirm, onDiscard, onClose };
}

/** The area checkbox at a position, in card order. Throws when it is missing
 *  so the tests read an element, typed as one. */
function checkboxAt(position: number): HTMLElement {
  const checkbox = screen.getAllByRole("checkbox")[position];
  if (!checkbox) throw new Error(`No area checkbox at position ${position}`);
  return checkbox;
}

describe("ListingRestoreReviewModal", () => {
  it("renders one ticked card per area", async () => {
    renderModal();
    expect(
      await screen.findByRole("button", { name: "Bring them all back" }),
    ).toBeEnabled();
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(AREAS.length);
    for (const checkbox of checkboxes) expect(checkbox).toBeChecked();
    expect(
      within(screen.getByRole("dialog")).getAllByRole("group"),
    ).toHaveLength(AREAS.length);
  });

  it("counts only the ticked areas on the confirm button", async () => {
    const { onConfirm } = renderModal();
    await screen.findByRole("button", { name: "Bring them all back" });
    fireEvent.click(checkboxAt(1));
    expect(
      screen.getByRole("button", { name: "Bring back 1 area" }),
    ).toBeEnabled();
    expect(
      screen.getByText(
        "Left out: this area stays as it is now, and its saved changes are dropped from this device.",
      ),
    ).toBeInTheDocument();

    // With nothing ticked the button stays focusable and says what it needs.
    fireEvent.click(checkboxAt(0));
    const hintButton = screen.getByRole("button", {
      name: "Tick an area to bring it back",
    });
    expect(hintButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(hintButton);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("names both sides of the comparison, even for one area", async () => {
    renderModal({ areas: AREAS.slice(0, 1) });
    expect(await screen.findByText("On screen now")).toBeInTheDocument();
    expect(screen.getByText("Comes back")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Clear all" }),
    ).not.toBeInTheDocument();
  });

  it("confirms with exactly the ticked area keys", async () => {
    const { onConfirm } = renderModal();
    await screen.findByRole("button", { name: "Bring them all back" });
    fireEvent.click(checkboxAt(0));
    fireEvent.click(screen.getByRole("button", { name: "Bring back 1 area" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith(new Set(["story"]));
  });

  it("offers to discard the saved copy when nothing differs", async () => {
    const { onDiscard } = renderModal({ areas: [] });
    expect(
      await screen.findByText(
        "Nothing here differs from what's on screen now.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Discard the saved copy" }),
    );
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });
});
