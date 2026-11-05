import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PersonaPortraitArt } from "./PersonaPortraitArt";
import { SubprofilePortraitCardCredits } from "./SubprofilePortraitCardCredits";
import { SubprofilePortraitCardFollow } from "./SubprofilePortraitCardFollow";
import type { PortraitCardView } from "./api/directoryCard.adapters";
import styles from "./SubprofilePortraitCard.module.css";

/** Pixel width to ask resizable hosts for: a wide card is about 250 to 320px,
 *  so 480 covers it on a 1.5x screen without fetching a full-size file. */
const PORTRAIT_SRC_SIZE = 480;

export interface SubprofilePortraitCardProps {
  view: PortraitCardView;
  /** The name's heading level, so the card fits the page outline it lands
   *  in. Defaults to h3 (the directory section carries the h2). */
  headingLevel?: "h2" | "h3" | "h4";
  /** A quiet one-line note under the credits, such as the You follow tab's
   *  "Following since Mar 2026". The directory passes none. */
  note?: ReactNode;
  /** The note's shorter wording for the compact card, where the long one
   *  would lose its end to the ellipsis. Defaults to `note`. */
  compactNote?: ReactNode;
}

/**
 * A persona in the directory grid ("The Credits"): a tall 4:5 portrait with
 * its availability pill, the profession line, name, tagline, who it is
 * credited with, and Follow beside View persona. View persona is the one real
 * link; its stretched ::after makes the whole card open the persona, and the
 * Follow button sits outside that link, above it on z-index.
 *
 * The card sizes to its grid cell and is its own size container. Under about
 * 230px wide (two columns on a phone) it turns compact: the profession line
 * drops its second half, the tagline clamps to two lines, the credit line
 * shortens, View persona keeps only its stretched area and Follow becomes an
 * icon disc on the picture's corner. An optional note stays one line in both
 * sizes, swapping to its compact wording when one is given.
 */
export function SubprofilePortraitCard({
  view,
  headingLevel = "h3",
  note,
  compactNote,
}: SubprofilePortraitCardProps) {
  const { t } = useTranslation();
  const Heading = headingLevel;
  const { ownerName } = view;
  // The one linked signal: the adapter sets ownerName for linked personas only.
  const isLinked = ownerName !== null;
  // A linked persona names its maker on a wide card; an unlinked one names
  // its family, so nothing ties it back to a member.
  const professionExtra = isLinked
    ? t("subprofiles:directory.card.byOwner", { name: ownerName })
    : t(view.familyLabelKey);

  return (
    <article className={styles.card}>
      <div className={styles.surface}>
        <div className={styles.media}>
          <PersonaPortraitArt
            imageUrl={view.image?.src ?? null}
            imageFocus={view.image?.crop}
            accent={view.accent}
            monogram={view.monogram}
            imageSrcSize={PORTRAIT_SRC_SIZE}
          />
          {view.availabilityPill && (
            <span
              className={styles.pill}
              data-tone={view.availabilityPill.tone}
            >
              <span className={styles.pillDot} aria-hidden />
              <span className={styles.pillLabel}>
                {t(view.availabilityPill.labelKey)}
              </span>
            </span>
          )}
        </div>
        <div className={styles.body}>
          <p className={styles.profession}>
            {t(view.kindLabelKey)}
            <span className={styles.professionExtra}>
              <span aria-hidden="true">{" · "}</span>
              {professionExtra}
            </span>
          </p>
          <Heading className={styles.name}>{view.titleName}</Heading>
          {view.tagline && <p className={styles.tagline}>{view.tagline}</p>}
          <SubprofilePortraitCardCredits
            credits={view.credits}
            isLinked={isLinked}
          />
          {note != null && (
            <p className={styles.note}>
              {compactNote == null ? (
                note
              ) : (
                <>
                  <span className={styles.noteLong}>{note}</span>
                  <span className={styles.noteShort}>{compactNote}</span>
                </>
              )}
            </p>
          )}
          <div className={styles.actions}>
            {view.canFollow && view.id !== null && (
              <SubprofilePortraitCardFollow
                personaId={view.id}
                personaName={view.titleName}
                followerCount={view.followerCount}
                viewerFollowing={view.viewerFollowing}
              />
            )}
            <Link
              to={view.href}
              className={styles.view}
              aria-label={t("subprofiles:directory.card.viewPersonaNamed", {
                name: view.titleName,
              })}
            >
              <span className={styles.viewLabel}>
                {t("subprofiles:directory.card.viewPersona")}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
