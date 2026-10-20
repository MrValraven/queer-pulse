import { AnimatePresence, m } from "motion/react";
import { FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistCardView } from "./api/studio.adapters";
import { StudioPlaylistCover } from "./StudioPlaylistCover";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import css from "./StudioPlaylist.module.css";

/** One playlist on a Studio grid. The cover link sits out of the tab order;
 *  the title link is the one a keyboard or screen reader meets, and the
 *  credit links to the persona's Studio page or the member's profile. The
 *  owner sees who can open it; nobody else is ever told. The owner and
 *  editors of a playlist with editors see a Collaborative marker; an invitee
 *  sees an Invited marker instead. */
export function StudioPlaylistCard({
  playlist,
}: {
  playlist: StudioPlaylistCardView;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const markerFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: reducedMotion ? 0 : 0.2 },
  };
  const { credit } = playlist;
  return (
    <article className={styles.card}>
      <div className={kit.coverArea}>
        <Link
          to={playlist.href}
          className={kit.coverLink}
          tabIndex={-1}
          aria-hidden="true"
        >
          <div className={styles.cardCov}>
            <StudioPlaylistCover
              coverUrls={playlist.coverUrls}
              tint={playlist.tint}
              label={t("studio:playlist.card.coverLabel")}
            />
          </div>
        </Link>
      </div>
      <h4>
        <Link to={playlist.href} className={kit.titleLink}>
          {playlist.name}
        </Link>
      </h4>
      <div className={`${styles.meta} ${css.metaRow}`}>
        <span>
          {credit.name &&
            (credit.href ? (
              <Link to={credit.href} className={kit.titleLink}>
                {credit.name}
              </Link>
            ) : (
              credit.name
            ))}
          {credit.name && " · "}
          {t("studio:facts.trackCount", { count: playlist.trackCount })}
        </span>
        {playlist.visibilityLabelKey && (
          <span className={css.visibilityChip}>
            {t(playlist.visibilityLabelKey)}
          </span>
        )}
        <AnimatePresence initial={false}>
          {playlist.role === "invitee" && (
            <m.span key="invited" className={css.collabChip} {...markerFade}>
              {t("studio:playlist.invite.cardChip")}
            </m.span>
          )}
          {playlist.isCollaborative && playlist.hasEditRights && (
            <m.span
              key="collaborative"
              className={css.collabChip}
              {...markerFade}
            >
              <FiUsers aria-hidden />
              {t("studio:playlist.collab.chip")}
            </m.span>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}
