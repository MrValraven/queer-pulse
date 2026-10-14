import { FiClock } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { outDateOf } from "./studioUpcoming";
import styles from "./StudioUpcoming.module.css";

/** Where the tracklist will be: "{count} tracks, out {date}". A non-owner
 *  of a scheduled release gets no track list until the day. */
export function StudioUpcomingNote({
  release,
}: {
  release: StudioReleaseView;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const line = outDateOf(release.publishAt, formatters);
  // A scheduled show has no episodes until the drop: leave the count out.
  const isEpisodeCountUnknown = release.isShow && release.trackCount === 0;
  if (isEpisodeCountUnknown && !line) return null;
  return (
    <p className={styles.note}>
      <FiClock aria-hidden />{" "}
      {isEpisodeCountUnknown && line
        ? t("studio:upcoming.outOn", { date: line.date, time: line.time })
        : line
          ? t("studio:upcoming.tracksOut", {
              count: release.trackCount,
              date: line.date,
            })
          : t("studio:facts.trackCount", { count: release.trackCount })}
    </p>
  );
}
