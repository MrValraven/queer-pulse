import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CommunitiesToolbar } from "./CommunitiesToolbar";
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
    needsDrain: false,
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

function renderToolbar(overrides: Partial<DiscoverCommunities> = {}) {
  return render(
    <TestProviders>
      <CommunitiesToolbar
        discover={stubDiscover(overrides)}
        active="discover"
        onChange={vi.fn()}
      />
    </TestProviders>,
  );
}

describe("CommunitiesToolbar", () => {
  it("announces the result count, which has no visible home until something is narrowing", async () => {
    const { container } = renderToolbar();

    // i18n catalogs load lazily, so the count needs findBy*.
    expect(await screen.findByText("2 communities")).toBeInTheDocument();

    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent("2 communities");
    // Nothing is narrowing, so the chip row (its only visible home) is absent
    // and the tab pill is the number a sighted member reads.
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();
  });

  it("puts the count on the chip row once a refinement is on", async () => {
    renderToolbar({
      searchInput: "art",
      q: "art",
      hasActiveRefinement: true,
      gridItems: [stubCommunity("a")],
      visible: [stubCommunity("a")],
    });

    expect(await screen.findByText("1 community")).toBeInTheDocument();
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("shows a removable chip for a non-default sort, which otherwise only exists inside the shut drawer", async () => {
    renderToolbar({ sort: "active" });

    expect(
      await screen.findByText("Sorted by Most active"),
    ).toBeInTheDocument();
  });

  it("drops search and Refine when the pool is empty and nothing is refined", async () => {
    renderToolbar({ gridItems: [], visible: [] });

    // The switch and the one useful action stay; searching nothing does not.
    expect(await screen.findByText("Start a community")).toBeInTheDocument();
    expect(
      screen.queryByRole("searchbox", { name: "Search communities" }),
    ).not.toBeInTheDocument();
  });
});
