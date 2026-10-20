import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  isDebounceSettling,
  useDebouncedValue,
} from "../../../shared/hooks/useDebouncedValue";
import {
  toPlaylistCandidateViews,
  toPlaylistEditorViews,
  type StudioPlaylistCandidateView,
  type StudioPlaylistEditorView,
} from "./studio.adapters";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import {
  getStudioPlaylistEditorCandidates,
  getStudioPlaylistEditors,
} from "./studioPlaylistEditors.api";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** How long typing pauses before a co-owner search goes to the server, the
 *  same wait as the connections search. */
const CANDIDATE_SEARCH_DEBOUNCE_MS = 250;

const NO_EDITORS: StudioPlaylistEditorView[] = [];
const NO_CANDIDATES: StudioPlaylistCandidateView[] = [];

const demoEditors = () => import("./studioDemoPlaylistEditors");

export interface StudioPlaylistEditorsResult {
  editors: StudioPlaylistEditorView[];
  loadState: StudioLoadState;
}

/** Who edits a playlist: the owner reads active editors and pending
 *  invites, an editor the active ones. Ask only as owner or editor. */
export function useStudioPlaylistEditors(
  playlistId: string,
  options: { isEnabled: boolean },
): StudioPlaylistEditorsResult {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.playlistEditors(demoMode, playlistId),
    enabled: options.isEnabled && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    queryFn: ({ client }): Promise<StudioPlaylistEditorView[]> =>
      readStudio(client, async () =>
        toPlaylistEditorViews(
          demoMode
            ? (await demoEditors()).demoPlaylistEditors(playlistId)
            : await getStudioPlaylistEditors(playlistId),
        ),
      ),
  });
  return {
    editors: query.data ?? NO_EDITORS,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}

export interface StudioPlaylistCandidatesResult {
  candidates: StudioPlaylistCandidateView[];
  loadState: StudioLoadState;
  /** The typed search has not been answered yet: a "no match" verdict waits. */
  isSearchPending: boolean;
}

/** A persona-credited playlist's pickable co-owners, searched on the server.
 *  The last answer stays on screen while the next one loads. */
export function useStudioPlaylistEditorCandidates(
  playlistId: string,
  searchQuery: string,
  options: { isEnabled: boolean },
): StudioPlaylistCandidatesResult {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const trimmedQuery = searchQuery.trim();
  const debouncedQuery = useDebouncedValue(
    trimmedQuery,
    CANDIDATE_SEARCH_DEBOUNCE_MS,
  );
  const query = useQuery({
    queryKey: studioKeys.playlistEditorCandidates(
      demoMode,
      playlistId,
      debouncedQuery,
    ),
    enabled: options.isEnabled && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    placeholderData: keepPreviousData,
    queryFn: ({ client }): Promise<StudioPlaylistCandidateView[]> =>
      readStudio(client, async () =>
        toPlaylistCandidateViews(
          demoMode
            ? (await demoEditors()).demoPlaylistEditorCandidates(
                playlistId,
                debouncedQuery,
              )
            : await getStudioPlaylistEditorCandidates(
                playlistId,
                debouncedQuery,
              ),
        ),
      ),
  });
  return {
    candidates: query.data ?? NO_CANDIDATES,
    loadState: studioLoadStateOf(query, query.data !== undefined),
    isSearchPending:
      isDebounceSettling(trimmedQuery, debouncedQuery) ||
      query.isPlaceholderData,
  };
}
