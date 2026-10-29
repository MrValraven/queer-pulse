import { useId } from "react";
import { FiExternalLink } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SPOTIFY_ROYALTY_SOURCE_URL } from "./studioLanding.data";
import styles from "./StudioLandingForArtists.module.css";

/**
 * "Worth knowing": the Spotify royalty fact as a full-width callout with a
 * coral rule, the label as an eyebrow, the fact in the display face and a
 * small source link to Spotify's own announcement. The Studio line follows
 * in the body face and states what Studio offers today. It claims no money
 * for Studio.
 *
 * The source opens in a new tab, which visually hidden text says, so the
 * link's accessible name ends with "(opens in a new tab)".
 */
export function StudioLandingSpotifyFact() {
  const { t } = useTranslation();
  const labelId = useId();

  return (
    <aside className={styles.fact} aria-labelledby={labelId}>
      <p id={labelId} className={styles.factLabel}>
        {t("studio:landing.forArtists.spotify.label")}
      </p>
      <p className={styles.factText}>
        {t("studio:landing.forArtists.spotify.fact")}
      </p>
      <a
        className={styles.factSource}
        href={SPOTIFY_ROYALTY_SOURCE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("studio:landing.forArtists.spotify.source")}
        <FiExternalLink aria-hidden="true" />
        <span className="visuallyHidden">
          {" "}
          {t("studio:landing.forArtists.spotify.opensNewTab")}
        </span>
      </a>
      <p className={styles.factStudio}>
        {t("studio:landing.forArtists.spotify.studio")}
      </p>
    </aside>
  );
}
