import { FiCheck, FiHeart, FiPause, FiPlay, FiPlus } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import type { StudioTrackView } from "./api/studio.adapters";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { useStudioSaveToggle } from "./useStudioSaveToggle";
import { useStudioShowcase } from "./useStudioShowcase";
import ss from "./studio.module.css";

const QUICK_TIP_AMOUNT = 2;

export function StudioTrackHero({
  track,
  onTip,
}: {
  track: StudioTrackView;
  onTip: () => void;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const player = useStudioPlayer();
  const isShowcase = useStudioShowcase();
  const save = useStudioSaveToggle({
    savedId: track.savedId,
    kind: "studio_track",
    title: track.title,
    href: track.href,
    meta: track.release.artist.name,
  });
  const isCurrent = player.isCurrentTrack(track.id);
  const isPlaying = isCurrent && player.status === "playing";

  return (
    <section className={`${ss.hero} ${ss.heroTight}`}>
      <div className={ss.heroInner}>
        <div className={ss.heroArt}>
          <ImageSlot
            src={track.release.coverUrl ?? undefined}
            tint={track.release.tint}
            width="100%"
            height="100%"
            radius={16}
            placeholder={`${t("studio:media.coverLabel")} · ${track.release.title}`}
            style={{ position: "absolute", inset: 0 }}
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className={ss.heroInfo}>
          <div className={ss.eb}>
            {t("studio:track.hero.eyebrow", {
              current: track.position,
              total: track.release.trackCount,
            })}
          </div>
          <h1>{track.title}</h1>
          <div className={ss.by}>
            <Translation
              i18nKey="studio:trackPage.byLine"
              components={{ strong: <strong />, em: <em /> }}
              values={{
                artist: track.release.artist.name,
                release: track.release.title,
              }}
            />
          </div>
          <div className={ss.stats}>
            {track.durationLabel && <span>{track.durationLabel}</span>}
            {track.isExplicit && (
              <>
                <span className={ss.dot} />
                <span>{t("studio:release.explicit")}</span>
              </>
            )}
          </div>
          <div className={ss.heroActions}>
            <button
              type="button"
              className={ss.playBig}
              disabled={!track.hasAudio}
              aria-label={
                isPlaying
                  ? t("studio:release.pauseTrack", { title: track.title })
                  : t("studio:release.playTrack", { title: track.title })
              }
              onClick={() =>
                isCurrent
                  ? player.togglePlay()
                  : void player.playRelease(track.releaseId, track.id)
              }
            >
              {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
            </button>
            <button
              type="button"
              aria-pressed={save.isSaved}
              aria-label={t(
                save.isSaved
                  ? "studio:save.removeSavedCta"
                  : "studio:save.saveReleaseCta",
                { title: track.title },
              )}
              onClick={save.toggle}
            >
              {save.isSaved ? <FiCheck aria-hidden /> : <FiPlus aria-hidden />}{" "}
              {save.isSaved
                ? t("studio:save.savedLabel")
                : t("studio:save.saveCta")}
            </button>
            {isShowcase && (
              <button type="button" className={ss.tip} onClick={onTip}>
                <FiHeart aria-hidden />{" "}
                {t("studio:player.tipCta", {
                  amount: formatters.currency(QUICK_TIP_AMOUNT),
                })}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
