import { MUSIC_ADMIN_LIST_KEY_ROOT } from "../../../gatherings/api/eventApiTarget";
import type { MusicEventBucket } from "./musicEvents.types";

/**
 * React-query keys for the music events console. `demoMode` sits last, as in
 * `eventKeys`, so the roots invalidate both modes. The list root is shared
 * with the gatherings hooks, which refresh it after a house write.
 */
export const musicEventKeys = {
  listRoot: MUSIC_ADMIN_LIST_KEY_ROOT,
  list: (bucket: MusicEventBucket, demoMode: boolean) =>
    [...MUSIC_ADMIN_LIST_KEY_ROOT, bucket, demoMode] as const,
  studioArtistsRoot: ["admin-studio-artists"] as const,
  studioArtists: (query: string, demoMode: boolean) =>
    ["admin-studio-artists", query, demoMode] as const,
};
