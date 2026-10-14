import { useId } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { subprofileLinksEditPath } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistView } from "./api/studio.adapters";
import { StudioExternalLinkList } from "./StudioExternalLinkList";
import studioStyles from "./studio.module.css";
import styles from "./StudioSupport.module.css";

/** "Support {persona}": the persona's Bandcamp, Ko-fi and Patreon links.
 *  Hidden from visitors when there are none; the owner gets a pointer to
 *  the persona editor's links instead. */
export function StudioArtistSupportCard({
  artist,
}: {
  artist: StudioArtistView;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const name = artist.artist.name;
  const hasLinks = artist.supportLinks.length > 0;
  if (!hasLinks && !artist.isOwner) return null;
  return (
    <section className={studioStyles.sideCard} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {t("studio:support.artistHeading", { name })}
      </h2>
      {hasLinks ? (
        <>
          <StudioExternalLinkList
            links={artist.supportLinks}
            label={t("studio:support.listLabel", { name })}
          />
          <p className={styles.note}>{t("studio:support.note", { name })}</p>
        </>
      ) : (
        <>
          <p className={styles.note}>{t("studio:support.ownerEmpty")}</p>
          <Link
            to={subprofileLinksEditPath(artist.artist.id)}
            className={styles.ownerLink}
          >
            {t("studio:support.ownerEmptyCta")} <FiArrowRight aria-hidden />
          </Link>
        </>
      )}
    </section>
  );
}
