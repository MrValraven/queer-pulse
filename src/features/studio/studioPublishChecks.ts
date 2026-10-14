import { isSourcedReleaseType } from "./api/studio.adapters";
import type { StudioReleaseType, StudioSource } from "./api/studio.types";

export type PublishGap =
  "title" | "cover" | "tracks" | "sources" | "pending" | "rights";

/** Mirrors the server's publish rule and its order (409 `studio_publish_missing_*` and
 *  `studio_publish_tracks_pending`), so the page explains a refusal before
 *  the member meets it. The sources line takes `{titles}`. */
export const PUBLISH_GAP_KEY: Record<PublishGap, string> = {
  title: "studio:uploadFlow.publish.gap.title",
  cover: "studio:uploadFlow.publish.gap.cover",
  rights: "studio:uploadFlow.publish.gap.rights",
  tracks: "studio:uploadFlow.publish.gap.tracks",
  sources: "studio:uploadFlow.publish.gap.sources",
  pending: "studio:uploadFlow.publish.gap.pending",
};

/** Artist kinds (spec 4.4, 6.3): on edit, lip-sync and mix releases, the
 *  titles of tracks with audio whose sources were read and are empty, in
 *  tracklist order. A track not read yet is left to the server's check. */
export function tracksMissingSourcesOf(
  type: StudioReleaseType,
  tracks: { id: string; title: string; hasAudio: boolean }[],
  sourcesByTrackId: Record<string, StudioSource[] | undefined>,
): string[] {
  if (!isSourcedReleaseType(type)) return [];
  return tracks
    .filter(
      (track) => track.hasAudio && sourcesByTrackId[track.id]?.length === 0,
    )
    .map((track) => track.title);
}

/** The rights sentence by type (spec 6.3). */
export function rightsLabelKeyOf(type: StudioReleaseType): string {
  return isSourcedReleaseType(type)
    ? "studio:uploadFlow.publish.rightsLabelSourced"
    : "studio:uploadFlow.publish.rightsLabel";
}

export function publishGapsOf(input: {
  title: string;
  hasCover: boolean;
  playableTrackCount: number;
  hasPendingUploads: boolean;
  isRightsConfirmed: boolean;
  tracksMissingSources?: string[];
}): PublishGap[] {
  const gaps: PublishGap[] = [];
  if (!input.title.trim()) gaps.push("title");
  if (!input.hasCover) gaps.push("cover");
  if (!input.isRightsConfirmed) gaps.push("rights");
  if (input.playableTrackCount === 0) gaps.push("tracks");
  if ((input.tracksMissingSources ?? []).length > 0) gaps.push("sources");
  if (input.hasPendingUploads) gaps.push("pending");
  return gaps;
}
