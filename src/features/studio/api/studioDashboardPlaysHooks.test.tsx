import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEMO_ARTIST_LATE_BLOOMERS,
  DEMO_ARTIST_MARIANA,
} from "./studioDemoMe.data";
import { useStudioArtistPlays } from "./useStudioArtistPlays";
import { useStudioTopSupporters } from "./useStudioTopSupporters";

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

describe("Studio dashboard plays hooks in demo", () => {
  // One fresh client per test, held across that test's renders.
  let wrapper = wrapperWith(new QueryClient());
  beforeEach(() => {
    wrapper = wrapperWith(
      new QueryClient({ defaultOptions: { queries: { retry: false } } }),
    );
  });

  it("reads Mariana's 28 days of plays with today last", async () => {
    const { result } = renderHook(
      () => useStudioArtistPlays(DEMO_ARTIST_MARIANA.id, true),
      { wrapper },
    );
    await waitFor(() => expect(result.current.plays).not.toBeNull());
    expect(result.current.plays?.days).toHaveLength(28);
    expect(result.current.plays?.days.at(-1)?.isToday).toBe(true);
    expect(
      result.current.plays?.days.some((day) => day.plays.isBelowThreshold),
    ).toBe(true);
  });

  it("reads Mariana's top supporters in order and none for Late Bloomers", async () => {
    const mariana = renderHook(
      () => useStudioTopSupporters(DEMO_ARTIST_MARIANA.id, true),
      { wrapper },
    );
    await waitFor(() =>
      expect(mariana.result.current.supporters?.identities[0]?.name).toBe(
        "Vanda Diesel",
      ),
    );
    const lateBloomers = renderHook(
      () => useStudioTopSupporters(DEMO_ARTIST_LATE_BLOOMERS.id, true),
      { wrapper },
    );
    await waitFor(() =>
      expect(lateBloomers.result.current.supporters?.identities).toEqual([]),
    );
  });

  it("answers not found for a persona the demo viewer does not own, and reads nothing while disabled", async () => {
    const other = renderHook(
      () => useStudioArtistPlays("sp-diogo-nightform", true),
      { wrapper },
    );
    await waitFor(() =>
      expect(other.result.current.loadState.isNotFound).toBe(true),
    );
    const disabled = renderHook(
      () => useStudioTopSupporters(DEMO_ARTIST_MARIANA.id, false),
      { wrapper },
    );
    expect(disabled.result.current.supporters).toBeNull();
  });
});
