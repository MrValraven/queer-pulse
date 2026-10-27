import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  studioErrorMessageKey,
  studioErrorMessageKeyOf,
} from "../studioErrors.data";
import {
  DEFAULT_STUDIO_PLAYBACK,
  type StudioPlaybackPreferencesDTO,
  type StudioPlaybackUpdateDTO,
} from "./studio.types";
import { getStudioPlayback, putStudioPlayback } from "./studioPlayback.api";
import { applyPlaybackPatch } from "./studioPlaybackPatch";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** What a save sends: any subset of the row, plus the one-time notice flag. */
export type StudioPlaybackPatch = StudioPlaybackUpdateDTO;

export interface StudioPlaybackPreferencesResult {
  preferences: StudioPlaybackPreferencesDTO;
  /** The live row is still on its first read. */
  isLoading: boolean;
  /** The first read failed and nothing is stored on screen yet (the
   *  defaults are showing). Stays true while Retry runs. */
  isError: boolean;
  /** Load state for the shared Studio load-error panel (carries Retry). */
  loadState: StudioLoadState;
  /** Reads the stored row again. */
  refetch: () => void;
  /** Saves at once: the control moves now, a refusal rolls it back. */
  savePreferences: (patch: StudioPlaybackPatch) => void;
}

/** A failed read falls back to the defaults quietly; a failed write toasts
 *  through this hook alone. */
const SILENT = { silentError: true } as const;
const LIVE_STALE_MS = 5 * 60_000;

/** The one cache entry every reader shares (settings page, player, rows). */
function usePlaybackQuery() {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  return useQuery({
    queryKey: studioKeys.playback(demoMode),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    meta: SILENT,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        demoMode
          ? (await import("./studioDemoPlayback")).demoGetStudioPlayback()
          : getStudioPlayback(),
      ),
  });
}

/** The member's player settings, read only: what the player and the track
 *  rows decide on. Defaults until the first read lands. */
export function useStudioPlaybackSettings(): StudioPlaybackPreferencesDTO {
  return usePlaybackQuery().data ?? DEFAULT_STUDIO_PLAYBACK;
}

/** The cached row, undefined until the first read lands (no defaults). Reads
 *  the same cache entry as every other playback reader. */
export function useStudioPlaybackRow():
  StudioPlaybackPreferencesDTO | undefined {
  return usePlaybackQuery().data;
}

/** Whether rows grey out explicit tracks and the queue skips them. */
export function useStudioHideExplicit(): boolean {
  return useStudioPlaybackSettings().hideExplicit;
}

/**
 * Read and save the settings (Studio settings page). Optimistic: the cache
 * takes the patch at once. A refusal puts the previous row back, toasts once
 * and re-reads the stored row, so two quick changes where one failed settle
 * on what the server holds. The demo writes its in-memory store.
 */
export function useStudioPlaybackPreferences(): StudioPlaybackPreferencesResult {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const query = usePlaybackQuery();
  const queryKey = studioKeys.playback(demoMode);
  const mutation = useMutation<
    StudioPlaybackPreferencesDTO,
    Error,
    StudioPlaybackPatch,
    { previous: StudioPlaybackPreferencesDTO | undefined }
  >({
    meta: SILENT,
    mutationFn: async (patch) =>
      demoMode
        ? (await import("./studioDemoPlayback")).demoPutStudioPlayback(patch)
        : putStudioPlayback(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<StudioPlaybackPreferencesDTO>(queryKey);
      // No row has loaded (pending or failed read): write nothing, so the
      // cache never holds a made-up row (history on, no stamp) that the
      // recorder and the notice would trust. The save still goes out.
      if (previous === undefined) return { previous };
      // The flag stamps the notice in the cache at once; it never lands on
      // the row itself.
      queryClient.setQueryData<StudioPlaybackPreferencesDTO>(
        queryKey,
        applyPlaybackPatch(previous, patch, new Date()),
      );
      return { previous };
    },
    onError: (error, _patch, context) => {
      // Only a loaded row goes back; with none, the re-read below fills it.
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      void queryClient.invalidateQueries({ queryKey });
      // Name the reason (offline, restricted, rate limit, server). Only a
      // failure with no nameable reason keeps the setting-specific line.
      const messageKey = studioErrorMessageKeyOf(error, "save");
      showToast(
        t(
          messageKey === studioErrorMessageKey(null)
            ? "studio:settingsLive.saveError"
            : messageKey,
        ),
        "error",
      );
    },
    onSuccess: (stored) => {
      queryClient.setQueryData(queryKey, stored);
    },
  });
  const loadState = studioLoadStateOf(query, query.data !== undefined);
  return {
    preferences: query.data ?? DEFAULT_STUDIO_PLAYBACK,
    isLoading: !demoMode && hasAccess && query.isPending,
    isError: loadState.isError,
    loadState,
    refetch: loadState.retry,
    savePreferences: (patch) => mutation.mutate(patch),
  };
}
