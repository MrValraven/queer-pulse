import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminCommunityGrid } from "./AdminCommunityGrid";
import type { Community } from "./adminCommunities.data";

// The component calls useAdminCommunities() itself, so the query boundary is
// mocked directly (same convention as AdminSettingsHistory.test.tsx) to get
// full control over loading/error/empty/populated states without a network.
let communities: Community[] | undefined = [];
let isLoading = false;
let isError = false;
vi.mock("./api/useAdminCommunities", () => ({
  useAdminCommunities: () => ({ data: communities, isLoading, isError }),
}));

beforeEach(() => {
  communities = [];
  isLoading = false;
  isError = false;
});

function renderGrid() {
  return render(
    <TestProviders>
      <AdminCommunityGrid onOpen={vi.fn()} onHealth={vi.fn()} />
    </TestProviders>,
  );
}

function makeCommunity(slug: string): Community {
  return {
    slug,
    name: `Community ${slug}`,
    initials: slug.slice(0, 2).toUpperCase(),
    tone: "jade",
    tag: "Test tag",
    description: "A test community.",
    members: "100",
    activity: "Steady",
    activePercent: 50,
    reports: 0,
    resolvedPercent: 100,
    health: 90,
    founded: "Jan 2024",
    spark: [3, 5],
    breakdown: [80, 100, null, 90],
    join: "Open",
    code: "Platform Code of Care",
    visibility: "public",
    support: false,
    moderators: [],
    queue: [],
  };
}

describe("AdminCommunityGrid", () => {
  it("shows the empty state when the platform has no communities", async () => {
    communities = [];
    renderGrid();
    // `admin` is a lazy-loaded i18n namespace, so the translated empty-state
    // text lands after the provider's post-commit chunk load — await it.
    expect(await screen.findByText(/No spaces/)).toBeInTheDocument();
  });

  // Loading and failure both leave `data` undefined, exactly as a genuinely
  // empty platform does. Telling an admin mid-incident that their platform has
  // no communities because a request timed out is the same class of lie as the
  // audit trail's.
  it("does not claim the platform is empty while communities are still loading", () => {
    communities = undefined;
    isLoading = true;
    renderGrid();
    expect(screen.queryByText(/No spaces/)).not.toBeInTheDocument();
  });

  it("says the load failed rather than showing the empty state on error", async () => {
    communities = undefined;
    isError = true;
    renderGrid();
    expect(await screen.findByText(/Couldn’t load/)).toBeInTheDocument();
    expect(screen.queryByText(/No spaces/)).not.toBeInTheDocument();
  });

  // The headline sits one element above the empty/error panel, but it reads
  // straight off `data?.length ?? 0` — so without this guard it would still
  // announce "0 spaces" while the fetch is in flight or after it fails, the
  // exact class of lie the two tests above already guard against one element
  // lower.
  it("does not announce zero spaces in the headline while loading", async () => {
    communities = undefined;
    isLoading = true;
    renderGrid();
    expect(await screen.findByText(/^Spaces,/)).toBeInTheDocument();
    expect(screen.queryByText(/0 spaces/)).not.toBeInTheDocument();
  });

  it("does not announce zero spaces in the headline after a failed load", async () => {
    communities = undefined;
    isError = true;
    renderGrid();
    expect(await screen.findByText(/^Spaces,/)).toBeInTheDocument();
    expect(screen.queryByText(/0 spaces/)).not.toBeInTheDocument();
  });

  it("spells the headline count from the number of communities rendered", async () => {
    communities = [makeCommunity("a"), makeCommunity("b"), makeCommunity("c")];
    renderGrid();
    expect(await screen.findByText(/Three spaces,/)).toBeInTheDocument();
  });

  it("says one space, singular, for a single community", async () => {
    communities = [makeCommunity("a")];
    renderGrid();
    expect(await screen.findByText(/One space,/)).toBeInTheDocument();
  });

  it("uses a numeral past thirty", async () => {
    communities = Array.from({ length: 31 }, (_, index) =>
      makeCommunity(`community-${index}`),
    );
    renderGrid();
    expect(await screen.findByText(/31 spaces,/)).toBeInTheDocument();
  });

  // Admins do not found communities — members do. The button was a dead toast
  // that implied an admin capability the platform deliberately doesn't grant.
  it("offers no way to create a community", () => {
    communities = [makeCommunity("a")];
    renderGrid();
    expect(
      screen.queryByRole("button", { name: /new community/i }),
    ).not.toBeInTheDocument();
  });
});
