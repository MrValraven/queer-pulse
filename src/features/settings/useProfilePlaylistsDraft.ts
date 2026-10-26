import { useState } from "react";
import { STUDIO_PLAYLIST_LIMITS } from "../studio/api/studio.types";
import { profilePlaylistsErrorKey } from "../studio/api/studioProfilePlaylistsErrors";
import {
  useSaveStudioProfilePlaylists,
  useStudioProfilePlaylists,
} from "../studio/api/useStudioProfilePlaylists";

export interface ProfilePlaylistsDraftValue {
  isShown: boolean;
  featuredIds: string[];
}

/**
 * The Edit profile "Playlists" draft. It lives in the page, beside the
 * profile draft, so the one save bar saves both: edits stay local until
 * `save`, and `discard` returns to what the server last sent.
 */
export function useProfilePlaylistsDraft() {
  const { isEnabled, query, view } = useStudioProfilePlaylists();
  const saveMutation = useSaveStudioProfilePlaylists();
  const [edited, setEdited] = useState<ProfilePlaylistsDraftValue | null>(null);

  const draft: ProfilePlaylistsDraftValue | null =
    edited ??
    (view ? { isShown: view.isShown, featuredIds: view.featuredIds } : null);

  return {
    isEnabled,
    view,
    draft,
    isLoading: query.isPending && isEnabled,
    /** Catalog key naming why the read failed, or null. */
    loadErrorKey: query.isError ? profilePlaylistsErrorKey(query.error) : null,
    maxFeatured: STUDIO_PLAYLIST_LIMITS.profileFeaturedMax,
    setDraft: setEdited,
    discard: () => setEdited(null),
    /** Saves the edited draft. Returns null on success, or the catalog key
     *  naming why the server refused it. */
    save: async (): Promise<string | null> => {
      if (!edited) return null;
      try {
        await saveMutation.mutateAsync(edited);
        setEdited(null);
        return null;
      } catch (error) {
        return profilePlaylistsErrorKey(error);
      }
    },
  };
}

export type ProfilePlaylistsDraft = ReturnType<typeof useProfilePlaylistsDraft>;
