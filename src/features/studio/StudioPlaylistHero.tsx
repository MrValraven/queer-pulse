import { useMemo, type Ref } from "react";
import { AnimatePresence, m } from "motion/react";
import { Link } from "react-router-dom";
import { FiShuffle } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, IconButton } from "../../shared/components/ui";
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
import { StudioPlaylistPlayButton } from "./StudioPlaylistPlayButton";
import { StudioHeroShare } from "./StudioHeroShare";
import { StudioSaveToggleButton } from "./StudioSaveButton";
import {
  useIsHeroActionsCompact,
  useIsHeroShareFolded,
} from "./studioHeroLayout";
import { useStudioSaveToggle } from "./useStudioSaveToggle";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import bylineCss from "./StudioPlaylistCollabChip.module.css";
import pageCss from "./StudioPlaylistPage.module.css";

/** Cover mosaic, name, credit, the owner's visibility chip, the Collaborative
 *  chip for the owner and editors of a playlist with editors, the facts, and
 *  Play playlist, Shuffle, Save (a playlist you neither own nor edit), Share
 *  and the owner's or the editor's menu.
 *  Below 1280px every action after Play is a round icon with a tooltip,
 *  and the menu stays last; below 1440px the owner's and the editor's
 *  Share folds into that menu with every way to share. Shuffle is computed
 *  in the browser and sent nowhere. The saved snapshot
 *  holds the name and link only: a credit can change after the save, so the
 *  snapshot carries no credit and can never pair a member with a persona.
 *  Save and the menu fade as they swap when an invitee accepts. The page
 *  finds the menu trigger through `actionsMenuRef` and the h1 through
 *  `titleRef` to move focus after Accept.
 *  `sentinelRef` marks the hero's foot for the sticky header. */
export function StudioPlaylistHero({
  playlist,
  onOwnerAction,
  onOpenEditors,
  actionsMenuRef,
  titleRef,
  sentinelRef,
}: {
  playlist: StudioPlaylistView;
  onOwnerAction: (action: StudioPlaylistOwnerAction) => void;
  onOpenEditors: () => void;
  /** The wrapper around the owner's or the editor's menu. */
  actionsMenuRef?: Ref<HTMLDivElement>;
  /** The playlist name inside the page h1. */
  titleRef?: Ref<HTMLSpanElement>;
  sentinelRef?: Ref<HTMLDivElement>;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const swapFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: {
      opacity: 0,
      transition: reducedMotion ? { duration: 0.12 } : STUDIO_EXIT,
    },
    transition: reducedMotion ? { duration: 0.12 } : STUDIO_FADE,
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
          meta: playlist.credit.name,
        },
  );
  const queue = useMemo(
    () => queueFromTracks(playlist.playableTracks),
    [playlist.playableTracks],
  );
  const isEmpty = queue.length === 0;
  const isCompact = useIsHeroActionsCompact();
  // Share folds into the menu, so only where there is one.
  const isShareInMenu = useIsHeroShareFolded() && playlist.hasEditRights;
  const shareTarget = {
    kind: "playlist",
    id: playlist.id,
    startAtSeconds: null,
  } as const;
  const shuffleLabel = t("studio:playlist.page.shuffleCta");
  const shuffle = () => {
    if (!isEmpty) void player.playTracks(shuffledQueue(queue));
  };
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
      isActionsCompact={isCompact}
      actions={
        <>
          <StudioPlaylistPlayButton playlist={playlist} />
          {isCompact ? (
            <IconButton
              aria-label={shuffleLabel}
              aria-disabled={isEmpty || undefined}
              tooltip
              onClick={shuffle}
            >
              <FiShuffle aria-hidden />
            </IconButton>
          ) : (
            <Button
              variant="quiet"
              aria-disabled={isEmpty || undefined}
              onClick={shuffle}
            >
              <FiShuffle aria-hidden /> {shuffleLabel}
            </Button>
          )}
          <AnimatePresence initial={false}>
            {!playlist.hasEditRights && (
              <m.span key="save" className={pageCss.swap} {...swapFade}>
                <StudioSaveToggleButton
                  save={save}
                  label={t("studio:save.saveReleaseCta", {
                    title: playlist.name,
                  })}
                  isIconOnly={isCompact}
                />
              </m.span>
            )}
          </AnimatePresence>
          <AnimatePresence initial={false}>
            {!isShareInMenu && (
              <m.span key="share" className={pageCss.swap} {...swapFade}>
                <StudioHeroShare
                  target={shareTarget}
                  title={playlist.name}
                  isIconOnly={isCompact}
                />
              </m.span>
            )}
          </AnimatePresence>
          <AnimatePresence initial={false}>
            {playlist.hasEditRights && (
              <m.div key="menu" ref={actionsMenuRef} {...swapFade}>
                <StudioPlaylistOwnerMenu
                  role={playlist.isOwner ? "owner" : "editor"}
                  onAction={onOwnerAction}
                  share={
                    isShareInMenu
                      ? { target: shareTarget, title: playlist.name }
                      : undefined
                  }
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
      <div ref={sentinelRef} aria-hidden="true" />
    </StudioDetailHero>
  );
}
