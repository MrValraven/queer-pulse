import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { useStudioFormatReleases } from "./useStudioFormatReleases";
import { useStudioFormats } from "./useStudioFormats";
import { useStudioLatestEpisodes } from "./useStudioLatestEpisodes";
import { studioKeys } from "./studioQueryKeys";

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

describe("artist kinds read hooks (demo)", () => {
  it("lists the formats with published content, in map order", async () => {
    const { result } = renderHook(() => useStudioFormats(), { wrapper });
    await waitFor(() =>
      expect(result.current.formats).toEqual([
        "music",
        "podcast",
        "spoken_word",
        "performance",
      ]),
    );
  });

  it("narrows releases to one format and reads nothing without one", async () => {
    const { result } = renderHook(
      () => ({
        podcasts: useStudioFormatReleases("podcast"),
        none: useStudioFormatReleases(null),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.podcasts.releases.length).toBe(1),
    );
    expect(result.current.podcasts.releases[0]?.isShow).toBe(true);
    // A disabled query reads as loading with nothing to show; the home page
    // only reads this result while a format is chosen.
    expect(result.current.none.releases).toEqual([]);
    expect(result.current.none.hasMore).toBe(false);
  });

  it("lists the newest published episodes first, drafts left out", async () => {
    const { result } = renderHook(() => useStudioLatestEpisodes(), { wrapper });
    await waitFor(() => expect(result.current.episodes.length).toBe(3));
    const dates = result.current.episodes.map(
      (episode) => episode.track.publishedAt ?? "",
    );
    expect([...dates].sort().reverse()).toEqual(dates);
    expect(
      result.current.episodes.some((episode) => episode.track.isDraft),
    ).toBe(false);
  });

  it("keeps format lists apart from the home grid's key", () => {
    expect(studioKeys.formatReleases(true, "podcast")[1]).toBe(
      "formatReleases",
    );
    expect(studioKeys.browse(true, null, null, "podcast")).toEqual([
      "studio",
      "browse",
      true,
      "none",
      "none",
      "podcast",
    ]);
    expect(studioKeys.search(true, "q", "all", null, null, null)).toEqual([
      "studio",
      "search",
      true,
      "q",
      "all",
      "any",
      "any",
      "any",
    ]);
  });
});
