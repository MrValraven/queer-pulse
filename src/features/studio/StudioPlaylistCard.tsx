import { AnimatePresence, m } from "motion/react";
import { FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistCardView } from "./api/studio.adapters";
import { StudioMediaCard } from "./kit/StudioMediaCard";
import { StudioPlaylistCover } from "./StudioPlaylistCover";
import { STUDIO_FADE } from "./studioMotion";
import { useStudioPlaylistCardPlay } from "./useStudioPlaylistCardPlay";
import formats from "./StudioFormats.module.css";
import css from "./StudioPlaylist.module.css";

/** One playlist on a Studio shelf or grid (StudioMediaCard): the title is
 *  the card's one link, and the credit links to the persona's Studio page or
 *  the member's profile. The owner sees who can open it; nobody else is ever
 *  told. The owner and editors of a playlist with editors see a
 *  Collaborative marker; an invitee sees an Invited marker instead. */
export function StudioPlaylistCard({
  playlist,
}: {
  playlist: StudioPlaylistCardView;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const cardPlay = useStudioPlaylistCardPlay(playlist);
  const markerFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: reducedMotion ? { duration: 0 } : STUDIO_FADE,
  };
  const { credit } = playlist;
  return (
    <StudioMediaCard
      kind="playlist"
      href={playlist.href}
      title={playlist.name}
      isPlaying={cardPlay.isPlaying}
      playLabel={t(
        cardPlay.isPlaying
          ? "studio:playlist.page.pauseAria"
          : "studio:playlist.page.playAria",
        { name: playlist.name },
      )}
      onPlay={cardPlay.play}
      cover={
        <StudioPlaylistCover
          coverUrls={playlist.coverUrls}
          tint={playlist.tint}
          label={t("studio:playlist.card.coverLabel")}
        />
      }
      meta={
        <span className={css.metaRow}>
          <span>
            {credit.name &&
              (credit.href ? (
                <Link to={credit.href} className={formats.metaLink}>
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
        </span>
      }
    />
  );
}
