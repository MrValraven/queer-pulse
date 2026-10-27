import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_MILESTONE_FOLLOWERS_1000_ID } from "./studioDemoDashboard.data";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import { useStudioArtistStats } from "./useStudioArtistStats";
import { useStudioMilestoneCard } from "./useStudioMilestoneCard";
import { useStudioMilestones } from "./useStudioMilestones";
import { useStudioPlacements } from "./useStudioPlacements";

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));
vi.mock("./useStudioAccess", () => ({
  useStudioAccess: () => ({ hasAccess: true, uploadablePersonas: [] }),
}));

function wrapperWith(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("Studio dashboard hooks in demo", () => {
  // One fresh client per test, held across that test's renders.
  let wrapper = wrapperWith(new QueryClient());
  beforeEach(() => {
    wrapper = wrapperWith(
      new QueryClient({ defaultOptions: { queries: { retry: false } } }),
    );
  });

  it("reads Mariana's stats with a checklist, 12 weeks and the next release in demo", async () => {
    const { result } = renderHook(
      () => useStudioArtistStats(DEMO_ARTIST_MARIANA.id),
      { wrapper },
    );
    await waitFor(() => expect(result.current.stats).not.toBeNull());
    expect(result.current.stats?.followerGrowth).toHaveLength(12);
    expect(result.current.stats?.nextRelease?.title).toBe("Maré alta");
    expect(
      result.current.stats?.releases.some((row) => row.health.hasOpenItems),
    ).toBe(true);
  });

  it("pages placements two at a time in demo and fetches the next page on request", async () => {
    const { result } = renderHook(
      () => useStudioPlacements(DEMO_ARTIST_MARIANA.id),
      { wrapper },
    );
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(result.current.hasMore).toBe(true);
    act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.items.length).toBeGreaterThan(2));
  });

  it("lists Mariana's milestones newest first", async () => {
    const { result } = renderHook(
      () => useStudioMilestones(DEMO_ARTIST_MARIANA.id),
      { wrapper },
    );
    await waitFor(() => expect(result.current.milestones).not.toBeNull());
    const times = (result.current.milestones ?? []).map((milestone) =>
      milestone.reachedAt.getTime(),
    );
    expect(times.length).toBeGreaterThan(0);
    expect(times).toEqual([...times].sort((left, right) => right - left));
  });

  it("answers not found for a persona the demo viewer does not own", async () => {
    const { result } = renderHook(
      () => useStudioMilestones("sp-diogo-nightform"),
      { wrapper },
    );
    await waitFor(() => expect(result.current.loadState.isNotFound).toBe(true));
  });

  it("reads a milestone card, and not found for an unknown id", async () => {
    const card = renderHook(
      () => useStudioMilestoneCard(DEMO_MILESTONE_FOLLOWERS_1000_ID),
      { wrapper },
    );
    await waitFor(() =>
      expect(card.result.current.card?.artist.name).toBe("Mariana Sol"),
    );
    const missing = renderHook(
      () => useStudioMilestoneCard("demo-milestone-unknown"),
      { wrapper },
    );
    await waitFor(() =>
      expect(missing.result.current.loadState.isNotFound).toBe(true),
    );
  });
});
