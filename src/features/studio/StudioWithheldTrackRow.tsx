import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioHiddenTrackNumber } from "./StudioHiddenTrack";
import hiddenCss from "./StudioHiddenTrack.module.css";
import styles from "./studio.module.css";
import releaseStyles from "./StudioRelease.module.css";

/** A listener's withheld track (spec 5.3): it stays in the tracklist so the
 *  numbering holds, reads "Unavailable", and offers nothing to press. The
 *  cells match a normal row (number, cover, title, pay, time) so the grid
 *  and the phone layout hold; the empty `timeLabel` keeps the time cell's
 *  auto margin. */
export function StudioWithheldTrackRow({ position }: { position: number }) {
  const { t } = useTranslation();
  return (
    <li className={[styles.setRow, hiddenCss.hidden].join(" ")}>
      <StudioHiddenTrackNumber position={position} />
      <div className={styles.srCov} aria-hidden="true" />
      <div>
        <h5
          aria-label={t("studio:album.trackUnavailableAria", {
            number: position,
          })}
        >
          {t("studio:album.trackUnavailable")}
        </h5>
      </div>
      <div className={`${styles.pay} ${releaseStyles.payColumn}`} />
      <div className={`${styles.tm} ${releaseStyles.timeCell}`}>
        <span className={releaseStyles.timeLabel} />
      </div>
    </li>
  );
}
