export type PublishGap = "title" | "cover" | "tracks" | "pending" | "rights";

/** Mirrors the server's publish rule and its order (409 `studio_publish_missing_*` and
 *  `studio_publish_tracks_pending`), so the page explains a refusal before
 *  the member meets it. */
export const PUBLISH_GAP_KEY: Record<PublishGap, string> = {
  title: "studio:uploadFlow.publish.gap.title",
  cover: "studio:uploadFlow.publish.gap.cover",
  rights: "studio:uploadFlow.publish.gap.rights",
  tracks: "studio:uploadFlow.publish.gap.tracks",
  pending: "studio:uploadFlow.publish.gap.pending",
};

export function publishGapsOf(input: {
  title: string;
  hasCover: boolean;
  playableTrackCount: number;
  hasPendingUploads: boolean;
  isRightsConfirmed: boolean;
}): PublishGap[] {
  const gaps: PublishGap[] = [];
  if (!input.title.trim()) gaps.push("title");
  if (!input.hasCover) gaps.push("cover");
  if (!input.isRightsConfirmed) gaps.push("rights");
  if (input.playableTrackCount === 0) gaps.push("tracks");
  if (input.hasPendingUploads) gaps.push("pending");
  return gaps;
}
