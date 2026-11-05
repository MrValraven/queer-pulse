import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { FilterPageState } from "../../shared/components/filterPage";
import { CommunitiesFilterLayout } from "./CommunitiesFilterLayout";
import type { CommunitiesFilterSectionKey } from "./communitiesFilterSections";
import type { DiscoverCommunities } from "./useDiscoverCommunities";
import type { Community } from "../homepage/data/types";

/** A community with only the fields a card needs to exist in a count. */
function stubCommunity(slug: string): Community {
  return { slug, name: slug, href: `/communities/${slug}` } as Community;
}

function stubDiscover(
  overrides: Partial<DiscoverCommunities> = {},
): DiscoverCommunities {
  const items = [stubCommunity("a"), stubCommunity("b")];
  return {
    demoMode: true,
    scope: "discover",
    q: "",
    searchInput: "",
    setSearchInput: vi.fn(),
    sort: "newest",
    setSort: vi.fn(),
    filter: "all",
    setFilter: vi.fn(),
    isOpenOnly: false,
    setIsOpenOnly: vi.fn(),
    isBusyOnly: false,
    setIsBusyOnly: vi.fn(),
    tagIds: [],
    setTagIds: vi.fn(),
    joining: null,
    setJoining: vi.fn(),
    featured: null,
    isShowingFeatured: false,
    isShowingSkeletons: false,
    isShowingStaleResults: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
    visible: items,
    gridItems: items,
    categoryCounts: {},
    hasActiveRefinement: false,
    resetRefinements: vi.fn(),
    ...overrides,
  } as DiscoverCommunities;
}

/** Desktop view state with the sidebar shown and every section collapsed. */
function stubFilterPage(): FilterPageState<CommunitiesFilterSectionKey> {
  return {
    isMobile: false,
    isPanelOpen: true,
    togglePanel: vi.fn(),
    sectionsOpen: { category: false, quick: false, tags: false },
    toggleSection: vi.fn(),
    isSheetOpen: false,
    openSheet: vi.fn(),
    closeSheet: vi.fn(),
  };
}

/** The text a reader gets from an element: the `aria-hidden` odometer glyphs
 *  left out, the visually hidden copy of the number kept. */
function readableText(element: Element): string {
  const copy = element.cloneNode(true) as Element;
  copy
    .querySelectorAll('[aria-hidden="true"]')
    .forEach((hiddenNode) => hiddenNode.remove());
  return copy.textContent ?? "";
}

function renderLayout(discover: DiscoverCommunities) {
  return render(
    <TestProviders>
      <CommunitiesFilterLayout
        discover={discover}
        filterPage={stubFilterPage()}
      >
        <div data-testid="communities-grid" />
      </CommunitiesFilterLayout>
    </TestProviders>,
  );
}

describe("CommunitiesFilterLayout", () => {
  it("shows the result count in the polite live region of the results top", async () => {
    const { container } = renderLayout(stubDiscover());

    // i18n catalogs load lazily, so wait for the search box to name itself.
    expect(
      await screen.findByRole("searchbox", { name: "Search communities" }),
    ).toBeInTheDocument();
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect(readableText(live!)).toBe("2 communities");
  });

  it("offers Clear all filters only once a sidebar filter is on", async () => {
    const { unmount } = renderLayout(stubDiscover());
    expect(
      await screen.findByRole("searchbox", { name: "Search communities" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Clear all filters" }),
    ).not.toBeInTheDocument();
    unmount();

    const discover = stubDiscover({
      filter: "arts",
      hasActiveRefinement: true,
    });
    renderLayout(discover);
    const clearAll = await screen.findByRole("button", {
      name: "Clear all filters",
    });
    // The category shows as a removable chip beside the results.
    expect(
      screen.getByRole("button", { name: "Remove Arts" }),
    ).toBeInTheDocument();

    fireEvent.click(clearAll);
    expect(discover.setFilter).toHaveBeenCalledWith("all");
    expect(discover.setTagIds).toHaveBeenCalledWith([]);
    expect(discover.setSearchInput).toHaveBeenCalledWith("");
    // Clearing filters leaves the order alone.
    expect(discover.setSort).not.toHaveBeenCalled();
  });

  it("leaves the search term and the sort out of the chip row, since both are on screen", async () => {
    renderLayout(
      stubDiscover({
        searchInput: "art",
        q: "art",
        sort: "active",
        hasActiveRefinement: true,
      }),
    );

    expect(
      await screen.findByRole("searchbox", { name: "Search communities" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: 'Remove "art"' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Sorted by Most active")).not.toBeInTheDocument();
  });

  it("drops the search, the count and the Filters button when the pool is empty and nothing is refined", async () => {
    const { container } = renderLayout(
      stubDiscover({ gridItems: [], visible: [] }),
    );

    // i18n catalogs load lazily, so wait for the sidebar to name itself.
    await vi.waitFor(() =>
      expect(
        container.querySelector('aside[aria-label="Filter communities"]'),
      ).not.toBeNull(),
    );
    // The tab's empty state says it already, so no lone "0 communities".
    const live = container.querySelector('[aria-live="polite"]');
    expect(readableText(live!)).toBe("");
    expect(
      screen.queryByRole("searchbox", { name: "Search communities" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Hide filters" }),
    ).not.toBeInTheDocument();
  });
});
