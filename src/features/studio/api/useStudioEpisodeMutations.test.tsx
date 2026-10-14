import { act, renderHook, waitFor } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { toReleaseView, type StudioReleaseView } from "./studio.adapters";
import { demoStudioRelease } from "./studioDemoApi";
import { DEMO_DRAFT_EPISODE_ID, DEMO_SHOW_ID } from "./studioDemoFormats.data";
import { studioKeys } from "./studioQueryKeys";
import {
  useCreateStudioTrack,
  usePublishStudioEpisode,
} from "./useStudioTrackMutations";

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

function useHarness() {
  return {
    queryClient: useQueryClient(),
    publish: usePublishStudioEpisode(),
    create: useCreateStudioTrack(),
  };
}

describe("episode writes (demo)", () => {
  it("publishes a draft episode and updates the cached show", async () => {
    const { result } = renderHook(useHarness, { wrapper });
    const show = toReleaseView(demoStudioRelease(DEMO_SHOW_ID));
    act(() => {
      result.current.queryClient.setQueryData(
        studioKeys.release(true, DEMO_SHOW_ID),
        show,
      );
    });
    await act(() =>
      result.current.publish.mutateAsync({
        trackId: DEMO_DRAFT_EPISODE_ID,
        releaseId: DEMO_SHOW_ID,
      }),
    );
    const cached = result.current.queryClient.getQueryData<StudioReleaseView>(
      studioKeys.release(true, DEMO_SHOW_ID),
    );
    const row = cached?.tracks.find(
      (track) => track.id === DEMO_DRAFT_EPISODE_ID,
    );
    expect(row?.isDraft).toBe(false);
    expect(row?.publishedAt).not.toBeNull();
    expect(cached?.hasUnnotedChanges).toBe(false);
  });

  it("creates a draft episode on a live show in demo", async () => {
    const { result } = renderHook(useHarness, { wrapper });
    const show = toReleaseView(demoStudioRelease(DEMO_SHOW_ID));
    act(() => {
      result.current.queryClient.setQueryData(
        studioKeys.release(true, DEMO_SHOW_ID),
        show,
      );
    });
    const track = await act(() =>
      result.current.create.mutateAsync({
        releaseId: DEMO_SHOW_ID,
        title: "Bonus",
      }),
    );
    expect(track.isDraft).toBe(true);
    await waitFor(() =>
      expect(
        result.current.queryClient
          .getQueryData<StudioReleaseView>(
            studioKeys.release(true, DEMO_SHOW_ID),
          )
          ?.tracks.some((row) => row.id === track.id && row.isDraft),
      ).toBe(true),
    );
    const cached = result.current.queryClient.getQueryData<StudioReleaseView>(
      studioKeys.release(true, DEMO_SHOW_ID),
    );
    expect(cached?.hasUnnotedChanges).toBe(false);
    expect(cached?.trackCount).toBe(
      cached?.tracks.filter((row) => row.isDraft !== true).length,
    );
    expect(cached?.trackCount).toBeLessThan(cached?.tracks.length ?? 0);
  });
});
