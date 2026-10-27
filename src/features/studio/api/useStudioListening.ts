import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getStudioListeningRecent,
  getStudioListeningSummary,
  getStudioListeningSupporting,
} from "./studioListening.api";
import {
  listensPageOf,
  toListenView,
  toListeningSummaryView,
  toSupportingViews,
  type StudioListenView,
  type StudioListeningSummaryView,
  type StudioSupportingView,
} from "./studioListening.adapters";
import type { StudioListeningRange } from "./studioListening.types";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";
import {
  useStudioCursorPages,
  type StudioCursorPagesResult,
} from "./useStudioCursorPages";

// "Your listening" (CONTRACT-PART-2 section 4): the member's own summary per
// range, their recent history and the artists they support. The demo reads
// its in-memory listener (studioDemoYourListening); demo plays add no rows.

const loadDemoListening = () => import("./studioDemoYourListening");

/** The summary for one range. The cache holds the DTO; the view derives
 *  `isEmpty`. A range change keeps the shown lists until the new ones land. */
export function useStudioListeningSummary(range: StudioListeningRange): {
  summary: StudioListeningSummaryView | null;
  loadState: StudioLoadState;
  isRefreshing: boolean;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.listeningSummary(demoMode, range),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 0,
    placeholderData: keepPreviousData,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        demoMode
          ? (await loadDemoListening()).demoStudioListeningSummary(range)
          : getStudioListeningSummary(range),
      ),
  });
  const summary = useMemo(
    () =>
      query.data === undefined
        ? null
        : toListeningSummaryView(query.data, range),
    [query.data, range],
  );
  return {
    summary,
    loadState: studioLoadStateOf(query, query.data !== undefined),
    isRefreshing: query.isPlaceholderData,
  };
}

/** The member's history, newest first, a page at a time behind Show more. */
export function useStudioListeningRecent(): StudioCursorPagesResult<StudioListenView> {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  return useStudioCursorPages({
    queryKey: studioKeys.listeningRecent(demoMode),
    enabled: demoMode || hasAccess,
    read: async (cursor) =>
      listensPageOf(
        demoMode
          ? (await loadDemoListening()).demoStudioListeningRecent(cursor)
          : await getStudioListeningRecent(cursor),
      ),
    toView: toListenView,
  });
}

/** "Artists you support", newest opt-in first. The cache holds the views. */
export function useStudioListeningSupporting(): {
  items: StudioSupportingView[] | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.listeningSupporting(demoMode),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 0,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toSupportingViews(
          demoMode
            ? (await loadDemoListening()).demoStudioListeningSupporting()
            : await getStudioListeningSupporting(),
        ),
      ),
  });
  return {
    items: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}

/** Patches one row's Follow state in the cached list (after SubprofileFollow answers). */
export function useSetSupportingFollow(): (
  artistId: string,
  isFollowing: boolean,
) => void {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useCallback(
    (artistId, isFollowing) => {
      queryClient.setQueryData<StudioSupportingView[]>(
        studioKeys.listeningSupporting(demoMode),
        (previous) =>
          previous?.map((item) =>
            item.artist.id === artistId ? { ...item, isFollowing } : item,
          ),
      );
    },
    [demoMode, queryClient],
  );
}
