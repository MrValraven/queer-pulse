import { useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCheck,
  FiHeart,
  FiMusic,
  FiPause,
  FiPlay,
  FiPlus,
} from "react-icons/fi";
import { EmptyState, ImageSlot } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleasesResult } from "./api/useStudioReleases";
import { useStudioAccess } from "./api/useStudioAccess";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { StudioHomeHeroShowcase } from "./StudioHomeHeroShowcase";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioLine } from "./StudioSkeletons";
import { StudioTipModal } from "./StudioTipModal";
import { releaseFactsLine } from "./studioFacts";
import { studioUploadPath } from "./studioPaths";
import { useStudioSaveToggle } from "./useStudioSaveToggle";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/** The newest release, with Play, Save and (demo) Tip. Owns the page's
 *  loading, empty and error states so the grid below never doubles them. */
export function StudioHomeHero({
  releasesResult,
}: {
  releasesResult: StudioReleasesResult;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const player = useStudioPlayer();
  const isShowcase = useStudioShowcase();
  const { uploadablePersonas } = useStudioAccess();
  const [isTipOpen, setIsTipOpen] = useState(false);
  const { releases, loadState } = releasesResult;
  const newest = releases[0] ?? null;
  const save = useStudioSaveToggle(
    newest
      ? {
          savedId: newest.savedId,
          kind: "studio_release",
          title: newest.title,
          href: newest.href,
          meta: newest.artist.name,
        }
      : null,
  );

  if (loadState.isError || loadState.isNotFound)
    return <StudioLoadError loadState={loadState} />;
  if (loadState.isLoading) {
    return (
      <section className={styles.hero} aria-busy="true">
        <StudioLine width="60%" height={42} />
        <StudioLine width="35%" height={16} style={{ marginTop: 14 }} />
      </section>
    );
  }
  if (!newest) {
    return (
      <EmptyState
        icon={<FiMusic />}
        title={t("studio:home.empty.title")}
        description={t("studio:home.empty.body")}
        action={
          uploadablePersonas.length > 0
            ? {
                label: t("studio:home.empty.uploadCta"),
                to: studioUploadPath(),
              }
            : undefined
        }
        headingLevel={2}
      />
    );
  }

  const isCurrent = player.isCurrentRelease(newest.id);
  const isPlaying = isCurrent && player.status === "playing";
  return (
    <section className={styles.hero} aria-labelledby={headingId}>
      <div className={styles.heroInner}>
        <div className={styles.heroArt}>
          <ImageSlot
            src={newest.coverUrl ?? undefined}
            tint={newest.tint}
            width="100%"
            height="100%"
            radius={16}
            placeholder={`${t("studio:media.coverLabel")} · ${newest.artist.name}`}
            style={{ position: "absolute", inset: 0 }}
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className={styles.heroInfo}>
          <div className={styles.eb} id={headingId}>
            {t("studio:home.hero.eyebrow")}
          </div>
          <h1>
            <Link to={newest.href} className={kit.titleLink}>
              {newest.title}
            </Link>
          </h1>
          <div className={styles.by}>
            <Translation
              i18nKey="studio:home.hero.byLine"
              components={{ strong: <strong /> }}
              values={{
                artist: newest.artist.name,
                facts: releaseFactsLine(newest, t),
              }}
            />
          </div>
          {isShowcase && (
            <StudioHomeHeroShowcase artistName={newest.artist.name} />
          )}
          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.playBig}
              aria-label={
                isPlaying
                  ? t("studio:card.pauseRelease", { title: newest.title })
                  : t("studio:card.playRelease", { title: newest.title })
              }
              onClick={() =>
                isCurrent
                  ? player.togglePlay()
                  : void player.playRelease(newest.id)
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
                { title: newest.title },
              )}
              onClick={save.toggle}
            >
              {save.isSaved ? <FiCheck aria-hidden /> : <FiPlus aria-hidden />}{" "}
              {save.isSaved
                ? t("studio:save.savedLabel")
                : t("studio:save.saveCta")}
            </button>
            {isShowcase && (
              <button
                type="button"
                className={styles.tip}
                onClick={() => setIsTipOpen(true)}
              >
                <FiHeart aria-hidden />{" "}
                {t("studio:detail.tipArtistCta", {
                  artist: newest.artist.name,
                })}
              </button>
            )}
          </div>
        </div>
      </div>
      {isTipOpen && (
        <StudioTipModal
          recipient={newest.artist.name}
          onClose={() => setIsTipOpen(false)}
        />
      )}
    </section>
  );
}
