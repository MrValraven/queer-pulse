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
import type { StudioHomeHeroChoice } from "./studioHome.data";
import { studioUploadPath } from "./studioPaths";
import { useStudioSaveToggle } from "./useStudioSaveToggle";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import css from "./StudioCuration.module.css";

/** The featured release with its staff note, else the newest release, with
 *  Play, Save and (demo) Tip. Owns the page's loading, empty and error
 *  states so the rows below never double them. */
export function StudioHomeHero({
  releasesResult,
  hero,
  isHeroSettled,
}: {
  releasesResult: StudioReleasesResult;
  hero: StudioHomeHeroChoice;
  /** False while curation still loads: the hero shows its skeleton. */
  isHeroSettled: boolean;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const player = useStudioPlayer();
  const isShowcase = useStudioShowcase();
  const { uploadablePersonas } = useStudioAccess();
  const [isTipOpen, setIsTipOpen] = useState(false);
  const { loadState } = releasesResult;
  const release = hero.release;
  const save = useStudioSaveToggle(
    release
      ? {
          savedId: release.savedId,
          kind: "studio_release",
          title: release.title,
          href: release.href,
          meta: release.artist.name,
        }
      : null,
  );

  if (!release && (loadState.isError || loadState.isNotFound))
    return <StudioLoadError loadState={loadState} />;
  if (!isHeroSettled || (!release && loadState.isLoading)) {
    return (
      <section className={styles.hero} aria-busy="true">
        <StudioLine width="60%" height={42} />
        <StudioLine width="35%" height={16} style={{ marginTop: 14 }} />
      </section>
    );
  }
  if (!release) {
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

  const isCurrent = player.isCurrentRelease(release.id);
  const isPlaying = isCurrent && player.status === "playing";
  return (
    <section className={styles.hero} aria-labelledby={headingId}>
      <div className={styles.heroInner}>
        <div className={styles.heroArt}>
          <ImageSlot
            src={release.coverUrl ?? undefined}
            tint={release.tint}
            width="100%"
            height="100%"
            radius={16}
            placeholder={`${t("studio:media.coverLabel")} · ${release.artist.name}`}
            style={{ position: "absolute", inset: 0 }}
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className={styles.heroInfo}>
          <div className={styles.eb} id={headingId}>
            {t(
              hero.isFeatured
                ? "studio:home.hero.featuredEyebrow"
                : "studio:home.hero.eyebrow",
            )}
          </div>
          <h1>
            <Link to={release.href} className={kit.titleLink}>
              {release.title}
            </Link>
          </h1>
          {hero.note && (
            <p className={css.heroNote}>
              <span className="visuallyHidden">
                {t("studio:curation.noteLabel")}{" "}
              </span>
              {hero.note}
            </p>
          )}
          <div className={styles.by}>
            <Translation
              i18nKey="studio:home.hero.byLine"
              components={{ strong: <strong /> }}
              values={{
                artist: release.artist.name,
                facts: releaseFactsLine(release, t),
              }}
            />
          </div>
          {isShowcase && (
            <StudioHomeHeroShowcase artistName={release.artist.name} />
          )}
          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.playBig}
              aria-label={
                isPlaying
                  ? t("studio:card.pauseRelease", { title: release.title })
                  : t("studio:card.playRelease", { title: release.title })
              }
              onClick={() =>
                isCurrent
                  ? player.togglePlay()
                  : void player.playRelease(release.id)
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
                { title: release.title },
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
                  artist: release.artist.name,
                })}
              </button>
            )}
          </div>
        </div>
      </div>
      {isTipOpen && (
        <StudioTipModal
          recipient={release.artist.name}
          onClose={() => setIsTipOpen(false)}
        />
      )}
    </section>
  );
}
