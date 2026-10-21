import type { Ref } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiShuffle } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, Collapse, Spinner } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLikedTracksResult } from "./api/useStudioLikedTracks";
import { StudioDetailHero } from "./StudioDetailHero";
import { StudioLikedCover } from "./StudioLikedCover";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import { StudioLikedPlayButton } from "./StudioLikedPlayButton";
import type { StudioLikedPlayAll } from "./useStudioLikedPlayAll";
import likedCss from "./StudioLikedPage.module.css";
import pageCss from "./StudioPlaylistPage.module.css";

/** Liked songs' heart cover, its name, the Private chip and note, the
 *  facts, and Play and Shuffle over every like (the pages still waiting are
 *  read first, and the button says so). Liked songs is only ever the
 *  member's own, so it offers no save, share or owner menu. Play and
 *  Shuffle fold away while no like can play, and fold back in with the
 *  next. `sentinelRef` marks the hero's foot for the sticky header. */
export function StudioLikedHero({
  liked,
  playAll,
  sentinelRef,
}: {
  liked: StudioLikedTracksResult;
  /** The page's one Play and Shuffle state, shared with the sticky header. */
  playAll: StudioLikedPlayAll;
  sentinelRef?: Ref<HTMLDivElement>;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const title = t("studio:liked.title");
  const { playableTracks, trackCount, totalDurationSeconds } = liked;
  const hasPlayableTracks = playableTracks.length > 0 || liked.hasMore;
  const loadingLabel = t("studio:liked.page.loadingAll", {
    count: trackCount,
  });
  const minutes = Math.round(totalDurationSeconds / 60);
  const facts = [
    t("studio:facts.trackCount", { count: trackCount }),
    minutes > 0 ? t("studio:facts.minutes", { count: minutes }) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const statusFade = reducedMotion ? { duration: 0.12 } : STUDIO_FADE;

  return (
    <StudioDetailHero
      art={<StudioLikedCover radius={16} />}
      kind={[t("studio:playlist.page.eyebrow"), facts].join(" · ")}
      title={title}
      by={
        <span className={`${pageCss.chip} ${likedCss.privateChip}`}>
          {t("studio:playlist.visibility.private")}
        </span>
      }
      actionsClassName={likedCss.heroActionsFlush}
      actions={
        <Collapse isOpen={hasPlayableTracks}>
          <div className={likedCss.heroActionsRow}>
            <StudioLikedPlayButton liked={liked} playAll={playAll} />
            <Button
              variant="quiet"
              aria-busy={playAll.pendingMode === "shuffle" || undefined}
              aria-label={
                playAll.pendingMode === "shuffle"
                  ? t("studio:liked.page.cancelLoadingAria")
                  : undefined
              }
              onClick={() => {
                if (playAll.pendingMode !== null) playAll.cancel();
                else playAll.start("shuffle");
              }}
            >
              {playAll.pendingMode === "shuffle" ? (
                <Spinner />
              ) : (
                <FiShuffle aria-hidden />
              )}
              {t("studio:playlist.page.shuffleCta")}
            </Button>
            {/* Always mounted, so the reading line is announced. */}
            <span role="status" className={likedCss.loadingStatus}>
              <AnimatePresence initial={false}>
                {playAll.pendingMode !== null && (
                  <m.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: STUDIO_EXIT }}
                    transition={statusFade}
                  >
                    {loadingLabel}
                  </m.span>
                )}
              </AnimatePresence>
            </span>
          </div>
        </Collapse>
      }
    >
      <p className={pageCss.description}>
        {t("studio:liked.page.privateNote")}
      </p>
      <div ref={sentinelRef} aria-hidden="true" />
    </StudioDetailHero>
  );
}
