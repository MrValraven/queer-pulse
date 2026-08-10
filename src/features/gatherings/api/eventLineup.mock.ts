import { currentUserSlug, memberAvatar, memberName } from "../../members/data/members";
import type { EventLineupDTO } from "./events.api";

/**
 * Demo-mode lineup for the fixed demo gathering: the signed-in member is
 * tagged as a DJ, so `GatheringPerformerNudge` (Personas Phase 5, Moment 5)
 * has something real to render without a live backend. Mirrors
 * `demoEventPhotos()`'s network-free, lazily-imported shape.
 */
export function demoEventLineup(): EventLineupDTO {
  const viewerEntry = {
    slug: currentUserSlug,
    name: memberName(currentUserSlug),
    avatarUrl: memberAvatar(currentUserSlug)?.photo ?? null,
    role: "dj",
  };
  return { entries: [viewerEntry], viewerEntry };
}
