import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { STUDIO_DISCOVERY_LIMITS } from "../../studio/api/studio.types";
import { STUDIO_ADMIN_SILENT_META } from "../studioAdminDemoErrors";
import { ADMIN_STUDIO_KEY } from "./StudioAdminCurationHooks";
import {
  getAdminStudioLanding,
  searchAdminStudioLandingPersonas,
  searchAdminStudioLandingTracks,
  type AdminStudioLandingDTO,
  type AdminStudioLandingPersonaOptionDTO,
  type AdminStudioLandingTrackOptionDTO,
} from "./studioLandingAdmin.api";

export const adminStudioLandingKey = (demoMode: boolean) =>
  [ADMIN_STUDIO_KEY, "landing", demoMode] as const;

/** The Studio page's staff content: previews, artist cards, photos, founding
 *  artists and the shelf switch. */
export function useAdminStudioLanding() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminStudioLandingDTO>({
    queryKey: adminStudioLandingKey(demoMode),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 30_000,
    queryFn: async () =>
      demoMode
        ? (await import("../StudioAdminLanding.data")).demoAdminStudioLanding()
        : getAdminStudioLanding(),
  });
}

function trimmedSearch(query: string): string {
  return query
    .trim()
    .slice(0, STUDIO_DISCOVERY_LIMITS.adminSearchQueryMaxLength);
}

/** Published tracks by title, release or artist; nothing is read for a blank
 *  query. The caller debounces. */
export function useAdminStudioLandingTrackSearch(query: string) {
  const { demoMode } = useDemoMode();
  const trimmed = trimmedSearch(query);
  return useQuery<AdminStudioLandingTrackOptionDTO[]>({
    queryKey: [ADMIN_STUDIO_KEY, "landingTrackSearch", demoMode, trimmed],
    enabled: trimmed.length > 0,
    staleTime: 30_000,
    meta: STUDIO_ADMIN_SILENT_META,
    queryFn: async () =>
      demoMode
        ? (await import("../StudioAdminLanding.data")).demoLandingTrackSearch(
            trimmed,
          )
        : (await searchAdminStudioLandingTracks(trimmed)).items,
  });
}

/** Artist personas by name or handle; nothing is read for a blank query.
 *  The caller debounces. */
export function useAdminStudioLandingPersonaSearch(query: string) {
  const { demoMode } = useDemoMode();
  const trimmed = trimmedSearch(query);
  return useQuery<AdminStudioLandingPersonaOptionDTO[]>({
    queryKey: [ADMIN_STUDIO_KEY, "landingPersonaSearch", demoMode, trimmed],
    enabled: trimmed.length > 0,
    staleTime: 30_000,
    meta: STUDIO_ADMIN_SILENT_META,
    queryFn: async () =>
      demoMode
        ? (await import("../StudioAdminLanding.data")).demoLandingPersonaSearch(
            trimmed,
          )
        : (await searchAdminStudioLandingPersonas(trimmed)).items,
  });
}
