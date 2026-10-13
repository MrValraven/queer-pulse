import type { QueryClient } from "@tanstack/react-query";
import { studioErrorCodeOf } from "./studio.api";
import type { StudioSearchType } from "./studio.types";

/** Every Studio query key starts with "studio" so one invalidation reaches
 *  them all, and carries `demoMode` so the two modes never share a cache. */
export const studioKeys = {
  all: ["studio"] as const,
  /** Every member's and both modes' access query. */
  meAll: ["studio", "me"] as const,
  me: (demoMode: boolean, userId: string | null) =>
    ["studio", "me", demoMode, userId] as const,
  releases: (demoMode: boolean) => ["studio", "releases", demoMode] as const,
  release: (demoMode: boolean, releaseId: string) =>
    ["studio", "release", demoMode, releaseId] as const,
  track: (demoMode: boolean, trackId: string) =>
    ["studio", "track", demoMode, trackId] as const,
  artist: (demoMode: boolean, subprofileId: string) =>
    ["studio", "artist", demoMode, subprofileId] as const,
  search: (demoMode: boolean, query: string, type: StudioSearchType) =>
    ["studio", "search", demoMode, query, type] as const,
};

/** A Studio request refused with `studio_access_required` means the grant was
 *  withdrawn since GET /studio/me answered. Reading it again flips the gate to
 *  the teaser, and the player stops on the same signal. */
export function onStudioAccessLost(
  queryClient: QueryClient,
  error: unknown,
): void {
  if (studioErrorCodeOf(error) !== "studio_access_required") return;
  void queryClient.invalidateQueries({ queryKey: studioKeys.meAll });
}

/** Runs one Studio read, reporting a withdrawn grant before it rethrows. */
export async function readStudio<Result>(
  queryClient: QueryClient,
  read: () => Promise<Result>,
): Promise<Result> {
  try {
    return await read();
  } catch (error) {
    onStudioAccessLost(queryClient, error);
    throw error;
  }
}
