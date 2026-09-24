import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CinemaComingSoonFrame } from "./cinemaComingSoon.data";
import styles from "./CinemaComingSoonPlate.module.css";

/**
 * One still on the coming-soon film strip, drawn as the film artefact that
 * shows its point: a curator's title card for seasons, a filmmaker's slate
 * for local work, a subtitled frame for access. Decorative: the caption
 * beside it carries the meaning, so the plate is hidden from assistive
 * technology.
 */
export function CinemaComingSoonPlate({
  plate,
}: {
  plate: CinemaComingSoonFrame["plate"];
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.plate} aria-hidden="true">
      {plate === "titleCard" && (
        <div className={styles.titleCard}>
          <span className={styles.titleCardKicker}>
            {t("cinema:comingSoon.preview.plate.seasons.kicker")}
          </span>
          <span className={styles.titleCardTitle}>
            {t("cinema:comingSoon.preview.plate.seasons.title")}
          </span>
        </div>
      )}

      {plate === "slate" && (
        <div className={styles.slate}>
          <span className={styles.slateClapper} />
          <span className={styles.slateRow}>
            <span className={styles.slateCell}>
              <span className={styles.slateLabel}>
                {t("cinema:comingSoon.preview.plate.local.scene")}
              </span>
              <span className={styles.slateValue}>1</span>
            </span>
            <span className={styles.slateCell}>
              <span className={styles.slateLabel}>
                {t("cinema:comingSoon.preview.plate.local.take")}
              </span>
              <span className={styles.slateValue}>3</span>
            </span>
          </span>
          <span className={styles.slateNote}>
            {t("cinema:comingSoon.preview.plate.local.note")}
          </span>
        </div>
      )}

      {plate === "subtitled" && (
        <>
          <span className={styles.badges}>
            <span className={styles.badge}>
              {t("cinema:comingSoon.preview.plate.open.captions")}
            </span>
            <span className={styles.badge}>
              {t("cinema:comingSoon.preview.plate.open.audioDescription")}
            </span>
          </span>
          <span className={styles.subtitle}>
            {t("cinema:comingSoon.preview.plate.open.subtitle")}
          </span>
        </>
      )}
    </div>
  );
}
