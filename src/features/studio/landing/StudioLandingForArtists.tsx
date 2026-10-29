import { useId } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  STUDIO_LANDING_ARTIST_SHOTS,
  STUDIO_LANDING_ARTISTS_ID,
  STUDIO_LANDING_FOR_ARTISTS_POINTS,
  STUDIO_LANDING_PHONE_QUERY,
} from "./studioLanding.data";
import { StudioLandingCta } from "./StudioLandingCta";
import { StudioLandingDeviceFrame } from "./StudioLandingDeviceFrame";
import { StudioLandingScreenshot } from "./StudioLandingScreenshot";
import { StudioLandingSpotifyFact } from "./StudioLandingSpotifyFact";
import styles from "./StudioLandingForArtists.module.css";

/**
 * "Release on Studio": the artist pitch, anchored at `#artists`. Two
 * columns from 900px. The copy column holds the heading, the intro, the five
 * things artists get today, the Spotify fact, the founding artist block and
 * the call to action. The other column frames the artist dashboard, a laptop
 * above 720px and a phone below it; the shot loads lazily, since the section
 * sits below the fold.
 */
export function StudioLandingForArtists() {
  const { t } = useTranslation();
  const headingId = useId();
  const { loggedIn } = useAuth();
  const isPhoneViewport = useMediaQuery(STUDIO_LANDING_PHONE_QUERY);
  const shot = isPhoneViewport
    ? STUDIO_LANDING_ARTIST_SHOTS.phone
    : STUDIO_LANDING_ARTIST_SHOTS.laptop;

  return (
    <section
      id={STUDIO_LANDING_ARTISTS_ID}
      className={styles.section}
      aria-labelledby={headingId}
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            {t("studio:landing.forArtists.eyebrow")}
          </p>
          <h2 id={headingId} className={styles.title}>
            <Translation
              i18nKey="studio:landing.forArtists.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.intro}>{t("studio:landing.forArtists.intro")}</p>

          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- grid with list-style none loses the list role in Safari */}
          <ul className={styles.points} role="list">
            {STUDIO_LANDING_FOR_ARTISTS_POINTS.map(
              ({ pointId, titleKey, bodyKey, Icon }) => (
                <li key={pointId} className={styles.point}>
                  <span className={styles.icon} aria-hidden="true">
                    <Icon />
                  </span>
                  <div>
                    <h3 className={styles.pointTitle}>{t(titleKey)}</h3>
                    <p className={styles.pointBody}>{t(bodyKey)}</p>
                  </div>
                </li>
              ),
            )}
          </ul>

          <StudioLandingSpotifyFact />

          <div className={styles.founding}>
            <h3 className={styles.foundingTitle}>
              {t("studio:landing.forArtists.founding.title")}
            </h3>
            <p className={styles.foundingBody}>
              {loggedIn
                ? t("studio:landing.forArtists.founding.memberBody")
                : t("studio:landing.forArtists.founding.body")}
            </p>
            <p className={styles.foundingPriority}>
              {t("studio:landing.forArtists.founding.priority")}
            </p>
          </div>

          <StudioLandingCta placement="artists" audience="artist" />
        </div>

        <div className={styles.visual}>
          <StudioLandingDeviceFrame
            device={shot.device}
            className={
              shot.device === "phone" ? styles.phoneFrame : styles.laptopFrame
            }
          >
            <StudioLandingScreenshot shot={shot} />
          </StudioLandingDeviceFrame>
        </div>
      </div>
    </section>
  );
}
