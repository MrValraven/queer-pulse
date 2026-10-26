import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toPlaylistCardView,
  type StudioPlaylistCardView,
} from "./studio.adapters";
import type {
  StudioProfilePlaylistsDTO,
  UpdateStudioProfilePlaylistsBody,
} from "./studio.types";
import {
  getStudioProfilePlaylists,
  putStudioProfilePlaylists,
} from "./studioProfilePlaylists.api";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

export interface StudioProfilePlaylistsView {
  isShown: boolean;
  featuredIds: string[];
  items: StudioPlaylistCardView[];
}

const toView = (
  dto: StudioProfilePlaylistsDTO,
): StudioProfilePlaylistsView => ({
  isShown: dto.isShown,
  featuredIds: dto.featuredIds,
  items: dto.items.map(toPlaylistCardView),
});

const demoStore = () => import("./studioDemoPlaylists");

/** The member's profile-playlists setting. Disabled without a Studio grant
 *  (demo mode counts as one), so the Edit profile section never shows then. */
export function useStudioProfilePlaylists() {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const isEnabled = demoMode || hasAccess;
  const query = useQuery({
    queryKey: studioKeys.profilePlaylists(demoMode),
    enabled: isEnabled,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toView(
          demoMode
            ? (await demoStore()).demoProfilePlaylists()
            : await getStudioProfilePlaylists(),
        ),
      ),
  });
  return { isEnabled, query, view: query.data };
}

/** Saves the setting, then re-reads the member playlists blocks so a profile
 *  already in the cache shows the new choice. The caller words the error. */
export function useSaveStudioProfilePlaylists() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioProfilePlaylistsView,
    Error,
    UpdateStudioProfilePlaylistsBody
  >({
    meta: { silentError: true },
    mutationFn: async (body) =>
      toView(
        demoMode
          ? (await demoStore()).demoSetProfilePlaylists(body)
          : await putStudioProfilePlaylists(body),
      ),
    onSuccess: (view) => {
      queryClient.setQueryData(studioKeys.profilePlaylists(demoMode), view);
      void queryClient.invalidateQueries({
        queryKey: ["studio", "memberPlaylists", demoMode],
      });
    },
  });
}
