import { useId } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_COMING_SOON_TRACKS } from "./studioComingSoon.data";
import styles from "./StudioComingSoonTracklist.module.css";

/**
 * "What it will sound like": Side A of a record pulled halfway out of its
 * sleeve. The back of the sleeve carries the tracklist, one row per track
 * with its own CSS-drawn cover art (a tint and a waveform or groove motif by
 * list position), a "Track A1" label, a title and a body. The vinyl turns
 * slowly beside the sleeve on wide screens and rises out of its top edge on
 * narrower ones. Grooves and the centre label are decoration, so the tracks
 * stay a plain ordered list for assistive technology.
 */
export function StudioComingSoonTracklist() {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>
          {t("studio:comingSoon.preview.eyebrow")}
        </p>
        <h2 id={headingId} className={styles.title}>
          <Translation
            i18nKey="studio:comingSoon.preview.title"
            components={{ em: <em /> }}
          />
        </h2>
      </header>

      <div className={styles.stage}>
        <div className={styles.turntable} aria-hidden="true">
          <div className={styles.disc}>
            <span className={styles.discLabel}>
              <span className={styles.discLabelText}>
                {t("studio:comingSoon.preview.sideLabel")}
              </span>
            </span>
          </div>
        </div>

        <div className={styles.sleeve}>
          <ol className={styles.tracks}>
            {STUDIO_COMING_SOON_TRACKS.map(
              ({ id, titleKey, bodyKey }, trackIndex) => (
                <li key={id} className={styles.track}>
                  <span className={styles.art} aria-hidden="true" />
                  <div className={styles.meta}>
                    <span className={styles.trackLabel}>
                      {t("studio:comingSoon.preview.trackLabel", {
                        number: trackIndex + 1,
                      })}
                    </span>
                    <h3 className={styles.trackTitle}>{t(titleKey)}</h3>
                  </div>
                  <p className={styles.trackBody}>{t(bodyKey)}</p>
                </li>
              ),
            )}
          </ol>
        </div>
      </div>
    </section>
  );
}
