import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { DEMO_MUTED_SOURCES } from "../feedMutes.data";
import {
  getFeedMutes,
  muteFeedSource,
  unmuteFeedSource,
  type FeedMutedSource,
  type FeedSourceKind,
} from "./feedMutes.api";

/** One mute/unmute request. `name` is display copy for the toast only. */
export interface FeedMuteTarget {
  sourceKind: FeedSourceKind;
  sourceId: string;
  name: string;
}

/**
 * Deliberately NOT prefixed `["feed"]`. Muting invalidates the whole
 * `["feed"]` tree so the list reloads without the source just turned down,
 * and a mutes query sitting under that prefix would be refetched by its own
 * mutation — which in demo mode would immediately reset the list back to the
 * fixture and silently undo the mute.
 */
const MUTES_KEY = (demoMode: boolean) => ["feedMutes", demoMode] as const;

/**
 * The member's own muted feed sources (SOC-18), plus the two actions that
 * change the list.
 *
 * Demo mode keeps the whole thing in the query cache seeded from
 * `DEMO_MUTED_SOURCES`, so the prototype's mute and unmute both stick for the
 * session without a network call. Live mode reads and writes `/feed/mutes`.
 *
 * Muting invalidates `["feed"]` so the list the member is looking at reloads
 * without the source they just turned down. It never touches
 * `["communities"]`: their membership has not changed, and refetching it would
 * imply it had.
 */
export function useFeedMutes() {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = MUTES_KEY(demoMode);

  const query = useQuery<FeedMutedSource[]>({
    queryKey,
    // Demo mode resolves the fixture instead of calling the API, and keeps
    // whatever the session has since muted (the mutations write this cache
    // directly).
    queryFn: demoMode
      ? () => Promise.resolve([...DEMO_MUTED_SOURCES])
      : getFeedMutes,
    staleTime: demoMode ? Infinity : 30_000,
  });

  const sources = useMemo(() => query.data ?? [], [query.data]);

  const mutedIds = useMemo(
    () => new Set(sources.map((source) => source.sourceId)),
    [sources],
  );

  const refreshFeed = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["feed"] });
  }, [queryClient]);

  const muteMutation = useMutation({
    mutationFn: (target: FeedMuteTarget) =>
      demoMode
        ? Promise.resolve()
        : muteFeedSource(target.sourceKind, target.sourceId).then(() => {}),
    onSuccess: (_result, target) => {
      queryClient.setQueryData<FeedMutedSource[]>(queryKey, (current) => {
        const rows = current ?? [];
        if (rows.some((row) => row.sourceId === target.sourceId)) return rows;
        return [
          {
            sourceKind: target.sourceKind,
            sourceId: target.sourceId,
            name: target.name,
            link: "",
            mutedAt: new Date().toISOString(),
          },
          ...rows,
        ];
      });
      if (!demoMode) void queryClient.invalidateQueries({ queryKey });
      refreshFeed();
      showToast(t("feed:mute.mutedToast", { name: target.name }), "success");
    },
    onError: () => showToast(t("feed:mute.failedToast"), "error"),
  });

  const unmuteMutation = useMutation({
    mutationFn: (target: FeedMuteTarget) =>
      demoMode
        ? Promise.resolve()
        : unmuteFeedSource(target.sourceKind, target.sourceId).then(() => {}),
    onSuccess: (_result, target) => {
      queryClient.setQueryData<FeedMutedSource[]>(queryKey, (current) =>
        (current ?? []).filter((row) => row.sourceId !== target.sourceId),
      );
      if (!demoMode) void queryClient.invalidateQueries({ queryKey });
      refreshFeed();
      showToast(t("feed:mute.unmutedToast", { name: target.name }), "info");
    },
    onError: () => showToast(t("feed:mute.failedToast"), "error"),
  });

  return {
    sources,
    mutedIds,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    mute: muteMutation.mutate,
    unmute: unmuteMutation.mutate,
    isMuting: muteMutation.isPending,
  };
}
