import type { StudioMilestoneView } from "./api/studioDashboard.adapters";
import type { StudioMilestoneKind } from "./api/studioDashboard.types";

/** The share sentence for each milestone kind, in the studio catalog. */
export const MILESTONE_SENTENCE_KEY: Record<StudioMilestoneKind, string> = {
  followers: "studio:share.milestone.followers",
  first_placement: "studio:share.milestone.firstPlacement",
  track_plays: "studio:share.milestone.trackPlays",
  artist_plays: "studio:share.milestone.artistPlays",
};

/** The catalog key and its interpolation values: the persona always, the
 *  formatted threshold for every kind except a first placement, and the
 *  track title for a track plays milestone. */
export function milestoneSentenceOf(
  milestone: StudioMilestoneView,
  personaName: string,
  formatNumber: (value: number) => string,
): { key: string; values: Record<string, string> } {
  const values: Record<string, string> = { persona: personaName };
  if (milestone.kind !== "first_placement") {
    values.value = formatNumber(milestone.threshold);
  }
  if (milestone.kind === "track_plays" && milestone.track) {
    values.track = milestone.track.title;
  }
  return { key: MILESTONE_SENTENCE_KEY[milestone.kind], values };
}
