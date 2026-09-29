import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminListingRows } from "./AdminListingRows";
import type {
  AdminListingsStatusFilter,
  ListingQueueRow,
} from "./api/adminListings.api";

/**
 * A platform-held suggestion (leftovers item #3): a row with a suggester and
 * no submitter must credit the suggester by name, matching the fallback
 * `AskQuestionModal` already reads. The provenance sits on its own line in the
 * row's "who" cell. `createdAt` is left as an invalid date on purpose, so
 * `formatRelative` returns an empty string and the cell holds the provenance
 * line alone. `detail` carries only what the row reads: no category and no
 * photo, so the thumb falls back to initials.
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
    addedByStaffName: "",
    createdAt: "not-a-date",
    detail: {
      cats: [],
      photos: { wide: null, d1: null, d2: null, vibe: null },
    } as unknown as ListingQueueRow["detail"],
    ...overrides,
  };
}

const CAUGHT_UP_BODY = "Every submission has found its place.";

function renderRows(
  rows: ListingQueueRow[],
  {
    searchQuery = "",
    statusFilter = "all",
  }: { searchQuery?: string; statusFilter?: AdminListingsStatusFilter } = {},
) {
  return render(
    <AdminListingRows
      rows={rows}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
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
      await screen.findByText("Suggested by Jane Doe · No owner yet"),
    ).toBeInTheDocument();
  });

  it("shows Owned by the submitter's name when the row has one", async () => {
    renderRows([makeRow({ submitterName: "Rita V", submitterSlug: "rita" })]);

    expect(await screen.findByText("Owned by Rita V")).toBeInTheDocument();
  });

  it("reads No owner yet with neither a submitter, a suggester, nor a staff author", async () => {
    renderRows([makeRow()]);

    expect(await screen.findByText("No owner yet")).toBeInTheDocument();
  });

  it("names the staff author for a listing staff added that nobody owns yet", async () => {
    renderRows([makeRow({ addedByStaffName: "Tiago Costa" })]);

    expect(
      await screen.findByText("Added by Tiago Costa (staff) · No owner yet"),
    ).toBeInTheDocument();
  });

  it("shows the ref on the listing's meta line", async () => {
    renderRows([makeRow()]);

    expect(await screen.findByText("QPL-1")).toBeInTheDocument();
  });

  it("opens the row from the listing name button", async () => {
    const onOpen = vi.fn();
    const row = makeRow();
    render(
      <AdminListingRows
        rows={[row]}
        searchQuery=""
        statusFilter="all"
        selectedRefs={new Set()}
        atSelectionCap={false}
        animateEntrance={false}
        onOpen={onOpen}
        onToggle={vi.fn()}
        onToggleAll={vi.fn()}
      />,
      { wrapper: TestProviders },
    );

    const openButton = await screen.findByRole("button", {
      name: "Open Cafe Jade",
    });
    fireEvent.click(openButton);

    expect(onOpen).toHaveBeenCalledWith(row);
    expect(
      screen.queryByRole("button", { name: "View & preview" }),
    ).not.toBeInTheDocument();
  });

  it("celebrates a clear queue only on the All tab with no search", async () => {
    renderRows([]);

    expect(
      await screen.findByText(CAUGHT_UP_BODY, { exact: false }),
    ).toBeInTheDocument();
  });

  it("says a search matched nothing when the search text finds no listing", async () => {
    renderRows([], { searchQuery: "  aurora  ", statusFilter: "live" });

    expect(
      await screen.findByRole("heading", {
        name: "No listings match “aurora”",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Try a place name, a submitter, or a reference like QPL-2026-0008.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(CAUGHT_UP_BODY, { exact: false }),
    ).not.toBeInTheDocument();
  });

  it("names the empty status tab when a filtered tab holds nothing", async () => {
    renderRows([], { searchQuery: "   ", statusFilter: "question" });

    expect(
      await screen.findByRole("heading", {
        name: "Nothing in “Quick question” right now",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Listings land here as you move them through review."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(CAUGHT_UP_BODY, { exact: false }),
    ).not.toBeInTheDocument();
  });
});
