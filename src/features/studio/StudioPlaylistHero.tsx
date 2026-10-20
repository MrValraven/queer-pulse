import { useMemo, type Ref } from "react";
import { AnimatePresence, m } from "motion/react";
import { Link } from "react-router-dom";
import { FiCheck, FiPause, FiPlay, FiPlus, FiShuffle } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistView } from "./api/studio.adapters";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromTracks, shuffledQueue } from "./player/studioQueue";
import { StudioDetailHero } from "./StudioDetailHero";
import {
  StudioPlaylistOwnerMenu,
  type StudioPlaylistOwnerAction,
} from "./StudioPlaylistOwnerMenu";
import { StudioPlaylistCollabChip } from "./StudioPlaylistCollabChip";
import { StudioPlaylistCover } from "./StudioPlaylistCover";
import { StudioShareMenu } from "./share/StudioShareMenu";
import { useStudioSaveToggle } from "./useStudioSaveToggle";
import styles from "./studio.module.css";
import bylineCss from "./StudioPlaylistCollabChip.module.css";
import pageCss from "./StudioPlaylistPage.module.css";

/** Cover mosaic, name, credit, the owner's visibility chip, the Collaborative
 *  chip for the owner and editors of a playlist with editors, the facts, and
 *  Play playlist, Shuffle, Save (a playlist you neither own nor edit), Share
 *  and the owner's or the editor's menu.
 *  Shuffle is computed in the browser and sent nowhere. The saved snapshot
 *  holds the name and link only: a credit can change after the save, so the
 *  snapshot carries no credit and can never pair a member with a persona.
 *  Save and the menu fade as they swap when an invitee accepts. The page
 *  finds the menu trigger through `actionsMenuRef` and the h1 through
 *  `titleRef` to move focus after Accept. */
export function StudioPlaylistHero({
  playlist,
  onOwnerAction,
  onOpenEditors,
  actionsMenuRef,
  titleRef,
}: {
  playlist: StudioPlaylistView;
  onOwnerAction: (action: StudioPlaylistOwnerAction) => void;
  onOpenEditors: () => void;
  /** The wrapper around the owner's or the editor's menu. */
  actionsMenuRef?: Ref<HTMLDivElement>;
  /** The playlist name inside the page h1. */
  titleRef?: Ref<HTMLSpanElement>;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const swapFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: reducedMotion ? 0 : 0.18, ease: "easeOut" },
  } as const;
  const player = useStudioPlayer();
  const save = useStudioSaveToggle(
    playlist.hasEditRights
      ? null
      : {
          savedId: playlist.savedId,
          kind: "studio_playlist",
          title: playlist.name,
          href: playlist.href,
        },
  );
  const queue = useMemo(
    () => queueFromTracks(playlist.playableTracks),
    [playlist.playableTracks],
  );
  const isCurrent = queue.some((item) => player.isCurrentTrack(item.trackId));
  const isPlaying = isCurrent && player.status === "playing";
  const isEmpty = queue.length === 0;
  const minutes = Math.round(playlist.totalDurationSeconds / 60);
  const facts = [
    t("studio:facts.trackCount", { count: playlist.trackCount }),
    minutes > 0 ? t("studio:facts.minutes", { count: minutes }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <StudioDetailHero
      art={
        <StudioPlaylistCover
          coverUrls={playlist.coverUrls}
          tint={playlist.tint}
          label={t("studio:playlist.card.coverLabel")}
          radius={16}
        />
      }
      kind={[t("studio:playlist.page.eyebrow"), facts].join(" · ")}
      title={<span ref={titleRef}>{playlist.name}</span>}
      by={
        <div className={bylineCss.byline}>
          <span>
            <Translation
              i18nKey="studio:playlist.page.byline"
              values={{ name: playlist.credit.name }}
              components={{
                strong: playlist.credit.href ? (
                  <Link
                    to={playlist.credit.href}
                    className={pageCss.creditLink}
                  />
                ) : (
                  <strong />
                ),
              }}
            />
          </span>
          {playlist.visibilityLabelKey && (
            <span className={pageCss.chip}>
              {t(playlist.visibilityLabelKey)}
            </span>
          )}
          <AnimatePresence initial={false}>
            {playlist.isCollaborative && (
              <StudioPlaylistCollabChip
                key="collab"
                playlist={playlist}
                onOpen={onOpenEditors}
              />
            )}
          </AnimatePresence>
        </div>
      }
      actions={
        <>
          <button
            type="button"
            className={styles.playBig}
            aria-disabled={isEmpty || undefined}
            aria-label={t(
              isPlaying
                ? "studio:playlist.page.pauseAria"
                : "studio:playlist.page.playAria",
              { name: playlist.name },
            )}
            onClick={() => {
              if (isEmpty) return;
              if (isCurrent) player.togglePlay();
              else void player.playTracks(queue);
            }}
          >
            {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
          </button>
          <button
            type="button"
            aria-disabled={isEmpty || undefined}
            onClick={() => {
              if (!isEmpty) void player.playTracks(shuffledQueue(queue));
            }}
          >
            <FiShuffle aria-hidden /> {t("studio:playlist.page.shuffleCta")}
          </button>
          <AnimatePresence initial={false}>
            {!playlist.hasEditRights && (
              <m.button
                key="save"
                type="button"
                {...swapFade}
                aria-pressed={save.isSaved}
                aria-label={t(
                  save.isSaved
                    ? "studio:save.removeSavedCta"
                    : "studio:save.saveReleaseCta",
                  { title: playlist.name },
                )}
                onClick={save.toggle}
              >
                {save.isSaved ? (
                  <FiCheck aria-hidden />
                ) : (
                  <FiPlus aria-hidden />
                )}{" "}
                {save.isSaved
                  ? t("studio:save.savedLabel")
                  : t("studio:save.saveCta")}
              </m.button>
            )}
          </AnimatePresence>
          <StudioShareMenu
            target={{ kind: "playlist", id: playlist.id, startAtSeconds: null }}
            title={playlist.name}
            triggerLabel={t("studio:playlist.shareCta")}
          />
          <AnimatePresence initial={false}>
            {playlist.hasEditRights && (
              <m.div key="menu" ref={actionsMenuRef} {...swapFade}>
                <StudioPlaylistOwnerMenu
                  role={playlist.isOwner ? "owner" : "editor"}
                  onAction={onOwnerAction}
                />
              </m.div>
            )}
          </AnimatePresence>
        </>
      }
    >
      {playlist.description && (
        <p className={pageCss.description}>{playlist.description}</p>
      )}
    </StudioDetailHero>
  );
}
