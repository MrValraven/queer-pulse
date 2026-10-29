import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { isPrerendering } from "../../../shared/prerender";
import { toArtistRefView, type StudioArtistRefView } from "./studio.adapters";
import { getStudioFoundingArtists } from "./studioFounding.api";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const FOUNDING_STALE_MS = 5 * 60_000;
const NO_FOUNDING_IDS: ReadonlySet<string> = new Set<string>();

export interface StudioFoundingArtistsView {
  /** The launch shelf switch. */
  isShelfVisible: boolean;
  artists: StudioArtistRefView[];
}

/** The founding artists read for granted members: the launch shelf and the
 *  badge id set share this one query. Silent on failure; a card without its
 *  badge is not worth an error toast. */
export function useStudioFoundingArtists(): {
  founding: StudioFoundingArtistsView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.foundingArtists(demoMode),
    enabled: hasAccess && !isPrerendering(),
    staleTime: FOUNDING_STALE_MS,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async (): Promise<StudioFoundingArtistsView> => {
        const dto = demoMode
          ? (await import("./studioDemoFounding.data"))
              .DEMO_STUDIO_FOUNDING_ARTISTS
          : await getStudioFoundingArtists();
        return {
          isShelfVisible: dto.isShelfVisible,
          artists: dto.artists.map(toArtistRefView),
        };
      }),
  });
  return {
    founding: hasAccess ? (query.data ?? null) : null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}

/** The founding id set for card badges; empty until the read lands, and
 *  without Studio access. */
export function useStudioFoundingArtistIds(): ReadonlySet<string> {
  const { founding } = useStudioFoundingArtists();
  return useMemo(
    () =>
      founding
        ? new Set(founding.artists.map((artist) => artist.id))
        : NO_FOUNDING_IDS,
    [founding],
  );
}
