import { QrCode } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPressKitView } from "./api/studio.adapters";
import styles from "./StudioOneSheet.module.css";

// Fixed, so the code keeps dark-on-light polarity on any paper.
const QR_LIGHT = "rgba(var(--cream-rgb), 1)";
const QR_DARK = "var(--plum)";
const QR_SIZE = 112;

/** The A4 one-sheet. Always light (`data-theme="light"`). Print content
 *  only: every conditional follows the press kit's data, and nothing on the
 *  sheet opens or closes. */
export function StudioOneSheet({
  pressKit,
  personaUrl,
}: {
  pressKit: StudioPressKitView;
  /** The absolute /p/<handle> address; null hides the QR. */
  personaUrl: string | null;
}) {
  const { t } = useTranslation();
  const { artist } = pressKit;
  const links = [...pressKit.socialLinks, ...pressKit.supportLinks];
  return (
    <article
      className={styles.sheet}
      data-theme="light"
      aria-label={t("studio:oneSheet.label", { name: artist.name })}
    >
      <header className={styles.top}>
        {artist.avatarUrl ? (
          <img
            className={styles.portrait}
            src={artist.avatarUrl}
            alt=""
            loading="eager"
          />
        ) : (
          <span className={styles.initials} aria-hidden>
            {artist.initials}
          </span>
        )}
        <div>
          <h1 className={styles.name}>{artist.name}</h1>
          <p className={styles.kind}>
            {[t(artist.kindLabelKey), artist.city].filter(Boolean).join(" · ")}
          </p>
          {pressKit.pitch && <p className={styles.pitch}>{pressKit.pitch}</p>}
        </div>
      </header>
      <div className={styles.columns}>
        <div className={styles.main}>
          {pressKit.oneSheetBio && (
            <section>
              <h2 className={styles.heading}>{t("studio:oneSheet.bio")}</h2>
              <p className={styles.bio}>{pressKit.oneSheetBio}</p>
            </section>
          )}
          {pressKit.featuredTracks.length > 0 && (
            <section>
              <h2 className={styles.heading}>
                {t("studio:oneSheet.bestTracks")}
              </h2>
              <ol className={styles.tracks}>
                {pressKit.featuredTracks.map((track) => (
                  <li key={track.id}>
                    <strong>{track.title}</strong>{" "}
                    <span className={styles.muted}>
                      {[track.release.title, track.durationLabel]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {pressKit.releases.length > 0 && (
            <section>
              <h2 className={styles.heading}>
                {t("studio:oneSheet.releases")}
              </h2>
              <ul className={styles.releases}>
                {pressKit.releases.map((release) => (
                  <li key={release.id}>
                    <strong>{release.title}</strong>{" "}
                    <span className={styles.muted}>
                      {[t(release.typeLabelKey), release.releaseYear]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <aside className={styles.side}>
          {pressKit.contact && (
            <section>
              <h2 className={styles.heading}>{t("studio:oneSheet.contact")}</h2>
              <p className={styles.contact}>{pressKit.contact.label}</p>
            </section>
          )}
          {links.length > 0 && (
            <section>
              <h2 className={styles.heading}>{t("studio:oneSheet.links")}</h2>
              <ul className={styles.links}>
                {links.map((link, linkIndex) => (
                  <li key={`${link.platform}-${link.handleLabel}-${linkIndex}`}>
                    <span className={styles.muted}>{link.platformLabel}</span>{" "}
                    {link.handleLabel}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {personaUrl && (
            <section className={styles.qr}>
              <QrCode
                url={personaUrl}
                ariaLabel={t("studio:oneSheet.qrLabel", { name: artist.name })}
                size={QR_SIZE}
                lightFill={QR_LIGHT}
                darkFill={QR_DARK}
                hasLightPlate
              />
              <p className={styles.qrCaption}>
                {personaUrl.replace(/^https?:\/\//, "")}
              </p>
            </section>
          )}
        </aside>
      </div>
    </article>
  );
}
