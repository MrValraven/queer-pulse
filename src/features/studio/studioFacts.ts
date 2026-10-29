import type { TFunction } from "../../shared/i18n/types";

/** "EP · 5 tracks · 22 min 10 s", from data. The length part is left out until
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
  const totalSeconds = Math.round(release.totalDurationSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const lengthParts: string[] = [];
  if (minutes > 0) {
    lengthParts.push(t("studio:facts.minutes", { count: minutes }));
  }
  if (seconds > 0) {
    lengthParts.push(t("studio:facts.seconds", { count: seconds }));
  }
  if (lengthParts.length > 0) parts.push(lengthParts.join(" "));
  return parts.join(" · ");
}
