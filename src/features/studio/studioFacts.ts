import type { TFunction } from "../../shared/i18n/types";

/** "EP · 5 tracks · 22 min", from data. The length part is left out until
 *  at least one track has a confirmed duration. */
export function releaseFactsLine(
  release: {
    typeLabelKey: string;
    trackCount: number;
    totalDurationSeconds: number;
    /** A scheduled show reports 0 episodes until the drop: no count then. */
    isShow?: boolean;
  },
  t: TFunction,
): string {
  const parts = [t(release.typeLabelKey)];
  const isEpisodeCountUnknown =
    release.isShow === true && release.trackCount === 0;
  if (!isEpisodeCountUnknown) {
    parts.push(
      t(
        release.isShow === true
          ? "studio:facts.episodeCount"
          : "studio:facts.trackCount",
        { count: release.trackCount },
      ),
    );
  }
  const minutes = Math.round(release.totalDurationSeconds / 60);
  if (minutes > 0) parts.push(t("studio:facts.minutes", { count: minutes }));
  return parts.join(" · ");
}
