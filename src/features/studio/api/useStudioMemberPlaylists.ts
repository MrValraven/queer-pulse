import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toPlaylistCardView,
  type StudioPlaylistCardView,
} from "./studio.adapters";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { getStudioMemberPlaylists } from "./studioPlaylists.api";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const NO_PLAYLISTS: StudioPlaylistCardView[] = [];

/** A member profile's Studio playlists block (first page, 24 at most).
 *  The server decides what a viewer may see; this renders it as it comes.
 *  Disabled for a viewer without a grant, who then gets nothing. */
export function useStudioMemberPlaylists(memberSlug: string | null): {
  playlists: StudioPlaylistCardView[];
  loadState: StudioLoadState;
  isEnabled: boolean;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const isEnabled = memberSlug !== null && (demoMode || hasAccess);
  const query = useQuery({
    queryKey: studioKeys.memberPlaylists(demoMode, memberSlug ?? ""),
    enabled: isEnabled,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () => {
        const slug = memberSlug ?? "";
        const page = demoMode
          ? (await import("./studioDemoPlaylists")).demoMemberPlaylistsPage(
              slug,
              null,
            )
          : await getStudioMemberPlaylists(slug, null);
        return page.items.map(toPlaylistCardView);
      }),
  });
  return {
    playlists: isEnabled ? (query.data ?? NO_PLAYLISTS) : NO_PLAYLISTS,
    loadState: studioLoadStateOf(query, query.data !== undefined),
    isEnabled,
  };
}
