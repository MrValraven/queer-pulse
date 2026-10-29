import { m, useIsPresent } from "motion/react";
import { Link } from "react-router-dom";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { ImageSlot } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useScrollReveal } from "../../../shared/hooks/useScrollReveal";
import type { StudioLandingArtistCardView } from "../api/studioLanding.adapters";
import { StudioFoundingBadge } from "../StudioFoundingBadge";
import { STUDIO_DISCLOSURE, STUDIO_DISCLOSURE_EXIT } from "../studioMotion";
import styles from "./StudioLandingArtists.module.css";

const NO_MOTION = { duration: 0 } as const;

interface StudioLandingArtistCardProps {
  card: StudioLandingArtistCardView;
  /** A signed-in member opens the persona page; a visitor gets no link. */
  isMember: boolean;
}

/**
 * One artist on the landing: avatar, stage name, kind, the founding badge and
 * an optional quote. It carries no city (a stage name next to a member's city
 * weakens the persona's anonymity). Members get one link, on the name, that
 * stretches over the card; visitors get plain text, because the Studio artist
 * page is gated. The card fades and rises in once as it scrolls into view.
 * The list item folds in and out when the read adds or drops a card, and
 * goes inert while it leaves.
 */
export function StudioLandingArtistCard({
  card,
  isMember,
}: StudioLandingArtistCardProps) {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const { artist } = card;
  const hasLink = isMember && artist.personaHref !== null;

  return (
    <m.li
      className={styles.item}
      initial={
        reducedMotion
          ? { opacity: 0 }
          : { opacity: 0, height: 0, overflow: "hidden" }
      }
      animate={{
        opacity: 1,
        height: "auto",
        transitionEnd: { overflow: "visible" },
      }}
      exit={{
        opacity: 0,
        ...(reducedMotion ? {} : { height: 0, overflow: "hidden" }),
        transition: reducedMotion ? NO_MOTION : STUDIO_DISCLOSURE_EXIT,
      }}
      transition={reducedMotion ? NO_MOTION : STUDIO_DISCLOSURE}
      inert={!isPresent}
    >
      <div ref={ref} className={styles.card} data-revealed={isVisible}>
        <ImageSlot
          className={styles.avatar}
          shape="circle"
          width={88}
          height={88}
          src={artist.avatarUrl ?? undefined}
          alt=""
          tint={artist.tint}
          initials={artist.initials}
        />
        <div className={styles.body}>
          <h3 className={styles.name}>
            {hasLink ? (
              <Link to={artist.personaHref ?? ""} className={styles.nameLink}>
                {artist.name}
              </Link>
            ) : (
              artist.name
            )}
          </h3>
          {artist.kindLabelKey || card.isFoundingArtist ? (
            <div className={styles.meta}>
              {artist.kindLabelKey ? (
                <p className={styles.kind}>{t(artist.kindLabelKey)}</p>
              ) : null}
              {card.isFoundingArtist ? <StudioFoundingBadge size="sm" /> : null}
            </div>
          ) : null}
          {card.quote ? (
            <blockquote className={styles.quote}>
              <p>{card.quote}</p>
            </blockquote>
          ) : null}
        </div>
      </div>
    </m.li>
  );
}
