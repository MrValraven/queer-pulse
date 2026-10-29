import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { STUDIO_DISCOVERY_LIMITS } from "../../studio/api/studio.types";
import { EMPTY_ADMIN_SPOTLIGHT } from "../studioAdminSpotlight.model";
import { STUDIO_ADMIN_SILENT_META } from "../studioAdminDemoErrors";
import { ADMIN_STUDIO_KEY } from "./StudioAdminCurationHooks";
import {
  getAdminStudioSpotlight,
  searchAdminStudioSpotlightArtists,
  type AdminStudioSpotlightArtistOptionDTO,
  type AdminStudioSpotlightDTO,
} from "./studioSpotlightAdmin.api";

// The Artists tab's reads and the cache helper its writes share
// (QUEERPULSE-STUDIO-SPOTLIGHT-CURATION-CONTRACT-2026-10-29.md).

export const adminStudioSpotlightKey = (demoMode: boolean) =>
  [ADMIN_STUDIO_KEY, "spotlight", demoMode] as const;

/** GET /admin/studio/spotlight: the artist of the month and New stars. */
export function useAdminStudioSpotlight() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminStudioSpotlightDTO>({
    queryKey: adminStudioSpotlightKey(demoMode),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 30_000,
    queryFn: async () =>
      demoMode
        ? (
            await import("../StudioAdminSpotlight.data")
          ).demoAdminStudioSpotlight()
        : getAdminStudioSpotlight(),
  });
}

/** Studio artists by name or handle. A blank query asks nothing; the
 *  caller debounces. */
export function useAdminStudioSpotlightArtistSearch(query: string) {
  const { demoMode } = useDemoMode();
  const trimmed = query
    .trim()
    .slice(0, STUDIO_DISCOVERY_LIMITS.adminSearchQueryMaxLength);
  return useQuery<AdminStudioSpotlightArtistOptionDTO[]>({
    queryKey: [ADMIN_STUDIO_KEY, "spotlightArtistSearch", demoMode, trimmed],
    enabled: trimmed.length > 0,
    staleTime: 30_000,
    meta: STUDIO_ADMIN_SILENT_META,
    queryFn: async () =>
      demoMode
        ? (
            await import("../StudioAdminSpotlight.data")
          ).demoSpotlightArtistSearch(trimmed)
        : (await searchAdminStudioSpotlightArtists(trimmed)).items,
  });
}

export function useAdminStudioSpotlightCache() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const read = () =>
    queryClient.getQueryData<AdminStudioSpotlightDTO>(
      adminStudioSpotlightKey(demoMode),
    ) ?? EMPTY_ADMIN_SPOTLIGHT;
  const write = (spotlight: AdminStudioSpotlightDTO) => {
    queryClient.setQueryData(adminStudioSpotlightKey(demoMode), spotlight);
  };
  // An optimistic patch first stops a read in flight, so its late answer
  // never overwrites the new order.
  const cancelRead = () =>
    queryClient.cancelQueries({ queryKey: adminStudioSpotlightKey(demoMode) });
  // After a refused live write the server's own rows are fetched again, in
  // case another console moved or removed them.
  const refetchRead = () => {
    void queryClient.invalidateQueries({
      queryKey: adminStudioSpotlightKey(demoMode),
    });
  };
  // Studio home reads the same spotlight, so a live write refreshes it too.
  const refreshMemberCuration = () => {
    void queryClient.invalidateQueries({ queryKey: ["studio", "curation"] });
  };
  return {
    demoMode,
    read,
    write,
    cancelRead,
    refetchRead,
    refreshMemberCuration,
  };
}
