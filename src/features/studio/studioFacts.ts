import type { TFunction } from "../../shared/i18n/types";

/** "EP · 5 tracks · 22 min", from data. The length part is left out until
 *  at least one track has a confirmed duration. */
export function releaseFactsLine(
  release: {
    typeLabelKey: string;
    trackCount: number;
    totalDurationSeconds: number;
  },
  t: TFunction,
): string {
  const parts = [
    t(release.typeLabelKey),
    t("studio:facts.trackCount", { count: release.trackCount }),
  ];
  const minutes = Math.round(release.totalDurationSeconds / 60);
  if (minutes > 0) parts.push(t("studio:facts.minutes", { count: minutes }));
  return parts.join(" · ");
}
