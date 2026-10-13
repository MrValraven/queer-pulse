import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiPause, FiPlay, FiPlus, FiShuffle } from "react-icons/fi";
import { useShareLink } from "../../shared/hooks";
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
import { StudioPlaylistCover } from "./StudioPlaylistCover";
import { useStudioSaveToggle } from "./useStudioSaveToggle";
import styles from "./studio.module.css";
import pageCss from "./StudioPlaylistPage.module.css";

/** Cover mosaic, name, credit, the owner's visibility chip, the facts, and
 *  Play playlist, Shuffle, Save (someone else's), Share and the owner menu.
 *  Shuffle is computed in the browser and sent nowhere. The saved snapshot
 *  holds the name and link only: a credit can change after the save, so the
 *  snapshot carries no credit and can never pair a member with a persona. */
export function StudioPlaylistHero({
  playlist,
  onOwnerAction,
}: {
  playlist: StudioPlaylistView;
  onOwnerAction: (action: StudioPlaylistOwnerAction) => void;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const { share } = useShareLink({
    copied: t("studio:detail.linkCopiedToast"),
    failed: t("studio:detail.copyFailedToast"),
  });
  const save = useStudioSaveToggle(
    playlist.isOwner
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
      title={playlist.name}
      by={
        <>
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
          {playlist.visibilityLabelKey && (
            <span className={pageCss.chip}>
              {t(playlist.visibilityLabelKey)}
            </span>
          )}
        </>
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
          {!playlist.isOwner && (
            <button
              type="button"
              aria-pressed={save.isSaved}
              aria-label={t(
                save.isSaved
                  ? "studio:save.removeSavedCta"
                  : "studio:save.saveReleaseCta",
                { title: playlist.name },
              )}
              onClick={save.toggle}
            >
              {save.isSaved ? <FiCheck aria-hidden /> : <FiPlus aria-hidden />}{" "}
              {save.isSaved
                ? t("studio:save.savedLabel")
                : t("studio:save.saveCta")}
            </button>
          )}
          <button
            type="button"
            onClick={() => void share(window.location.href)}
          >
            {t("studio:playlist.shareCta")}
          </button>
          {playlist.isOwner && (
            <StudioPlaylistOwnerMenu onAction={onOwnerAction} />
          )}
        </>
      }
    >
      {playlist.description && (
        <p className={pageCss.description}>{playlist.description}</p>
      )}
    </StudioDetailHero>
  );
}
