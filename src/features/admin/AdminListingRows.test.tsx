import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminListingRows } from "./AdminListingRows";
import type { ListingQueueRow } from "./api/adminListings.api";

/**
 * A platform-held suggestion (leftovers item #3): a row with a suggester and
 * no submitter must credit the suggester by name, matching the fallback
 * `AskQuestionModal` already reads. `createdAt` is left as an invalid date
 * and `hood` is left blank on purpose, so `formatRelative` returns an empty
 * string and the meta line holds nothing but the ref and the submitter text
 * this suite is asserting on.
 */
function makeRow(overrides: Partial<ListingQueueRow> = {}): ListingQueueRow {
  return {
    ref: "QPL-1",
    slug: "cafe-jade",
    name: "Cafe Jade",
    hood: "",
    status: "review",
    submitterName: "",
    submitterSlug: "",
    suggesterName: "",
    suggesterSlug: "",
    createdAt: "not-a-date",
    detail: {} as ListingQueueRow["detail"],
    ...overrides,
  };
}

function renderRows(rows: ListingQueueRow[]) {
  return render(
    <AdminListingRows
      rows={rows}
      selectedRefs={new Set()}
      atSelectionCap={false}
      animateEntrance={false}
      onOpen={vi.fn()}
      onToggle={vi.fn()}
      onToggleAll={vi.fn()}
    />,
    { wrapper: TestProviders },
  );
}

describe("AdminListingRows", () => {
  it("shows Suggested by the suggester's name for a row with no submitter", async () => {
    renderRows([
      makeRow({ suggesterName: "Jane Doe", suggesterSlug: "jane-doe" }),
    ]);

    expect(
      await screen.findByText("QPL-1 · Suggested by Jane Doe"),
    ).toBeInTheDocument();
  });

  it("shows the submitter's name when the row has one", async () => {
    renderRows([makeRow({ submitterName: "Rita V", submitterSlug: "rita" })]);

    expect(await screen.findByText("QPL-1 · Rita V")).toBeInTheDocument();
  });

  it("falls back to the unknown-member copy with neither a submitter nor a suggester", async () => {
    renderRows([makeRow()]);

    expect(
      await screen.findByText("QPL-1 · Unknown member"),
    ).toBeInTheDocument();
  });
});
