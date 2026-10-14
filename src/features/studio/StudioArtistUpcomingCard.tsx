import { useId } from "react";
import { Link } from "react-router-dom";
import { ImageSlot } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistView } from "./api/studio.adapters";
import { studioUploadPath } from "./studioPaths";
import { outDateOf } from "./studioUpcoming";
import { StudioNotifyMeButton } from "./StudioNotifyMeButton";
import studioStyles from "./studio.module.css";
import styles from "./StudioUpcoming.module.css";

/** "Upcoming": the persona's scheduled releases, soonest first, each with
 *  its date and Notify me (the owner gets Edit release instead). Built on
 *  the demo sidebar's old Upcoming card. */
export function StudioArtistUpcomingCard({
  artist,
}: {
  artist: StudioArtistView;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const headingId = useId();
  if (artist.upcoming.length === 0) return null;
  return (
    <section className={studioStyles.sideCard} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {t("studio:upcoming.cardHeading")}
      </h2>
      <ul className={styles.list}>
        {artist.upcoming.map((release) => {
          const line = outDateOf(release.publishAt, formatters);
          return (
            <li key={release.id} className={styles.row}>
              <span className={styles.cover}>
                <ImageSlot
                  src={release.coverUrl ?? undefined}
                  tint={release.tint}
                  width={48}
                  height={48}
                  radius={8}
                  placeholder=""
                />
              </span>
              <span className={styles.info}>
                <Link to={release.href} className={styles.title}>
                  {release.title}
                </Link>
                <span className={styles.when}>
                  {line ? t("studio:upcoming.outOn", line) : ""}
                </span>
              </span>
              {artist.isOwner ? (
                <Link
                  to={studioUploadPath(release.id)}
                  className={styles.edit}
                  aria-label={t("studio:owner.editAria", {
                    title: release.title,
                  })}
                >
                  {t("studio:owner.edit")}
                </Link>
              ) : (
                <StudioNotifyMeButton
                  releaseId={release.id}
                  releaseTitle={release.title}
                  isSet={release.isReminderSet}
                  className={styles.rowNotify}
                />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
