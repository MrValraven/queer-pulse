import { m } from "motion/react";
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { FiGift, FiMusic } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, EmptyState, IconButton } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseCardView } from "./api/studio.adapters";
import type { StudioReleasesResult } from "./api/useStudioReleases";
import { useStudioAccess } from "./api/useStudioAccess";
import { StudioPlayButton } from "./kit/StudioPlayButton";
import { StudioReleaseLikeButton } from "./StudioCollectionLikeButton";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { StudioHomeHeroShowcase } from "./StudioHomeHeroShowcase";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioReleaseCoverArt } from "./StudioReleaseCoverArt";
import { StudioHeroSkeleton } from "./StudioSkeletons";
import { StudioTipModal } from "./StudioTipModal";
import { releaseFactsLine } from "./studioFacts";
import type { StudioHomeHeroChoice } from "./studioHome.data";
import { useIsHeroActionsCompact } from "./studioHeroLayout";
import { STUDIO_FADE } from "./studioMotion";
import { studioUploadPath } from "./studioPaths";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import css from "./StudioCuration.module.css";

const REDUCED_FADE = { duration: 0.12 } as const;

/** The page's h1 when there is no release to title it: while the hero
 *  loads, an empty catalogue or a failed read still gives heading
 *  navigation a page title. */
function StudioHomePageHeading() {
  const { t } = useTranslation();
  return <h1 className="visuallyHidden">{t("studio:home.pageHeading")}</h1>;
}

/** Play, the heart and (demo) Tip under the hero title. The heart likes
 *  the release into the library; Tip carries a gift icon. Where the
 *  release heroes go icon-only (useIsHeroActionsCompact), the heart and Tip
 *  turn into square icon buttons with tooltips, so the row keeps one line. */
function StudioHomeHeroActions({
  release,
}: {
  release: StudioReleaseCardView;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const isShowcase = useStudioShowcase();
  const [isTipOpen, setIsTipOpen] = useState(false);
  const isCurrent = player.isCurrentRelease(release.id);
  const isPlaying = isCurrent && player.status === "playing";
  const isLoading = isCurrent && player.status === "loading";
  const isCompact = useIsHeroActionsCompact();
  const tipLabel = t("studio:detail.tipArtistCta", {
    artist: release.artist.name,
  });
  return (
    <div className={kit.homeHeroActions} data-compact={isCompact || undefined}>
      <StudioPlayButton
        size="hero"
        state={isLoading ? "loading" : isPlaying ? "playing" : "idle"}
        label={
          isPlaying
            ? t("studio:card.pauseRelease", { title: release.title })
            : t("studio:card.playRelease", { title: release.title })
        }
        onToggle={() =>
          isCurrent ? player.togglePlay() : void player.playRelease(release.id)
        }
      />
      <StudioReleaseLikeButton release={release} isIconOnly={isCompact} />
      {isShowcase &&
        (isCompact ? (
          <IconButton
            aria-label={tipLabel}
            tooltip
            className={kit.homeHeroTip}
            onClick={() => setIsTipOpen(true)}
          >
            <FiGift aria-hidden />
          </IconButton>
        ) : (
          <Button
            variant="quiet"
            className={kit.homeHeroTip}
            onClick={() => setIsTipOpen(true)}
          >
            <FiGift aria-hidden />
            {tipLabel}
          </Button>
        ))}
      {isTipOpen && (
        <StudioTipModal
          recipient={release.artist.name}
          onClose={() => setIsTipOpen(false)}
        />
      )}
    </div>
  );
}

/** The featured release with its staff note, else the newest release, with
 *  Play, the heart and (demo) Tip. Owns the page's loading, empty and error
 *  states so the rows below never double them. The skeleton holds the
 *  hero's shape and the real hero fades in over it. */
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
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const isShowcase = useStudioShowcase();
  const { uploadablePersonas } = useStudioAccess();
  const { loadState } = releasesResult;
  const release = hero.release;

  if (!release && (loadState.isError || loadState.isNotFound))
    return (
      <>
        <StudioHomePageHeading />
        <StudioLoadError
          loadState={loadState}
          what="studio:errors.what.newReleases"
        />
      </>
    );
  if (!isHeroSettled || (!release && loadState.isLoading)) {
    return (
      <section className={styles.hero}>
        <StudioHomePageHeading />
        <StudioHeroSkeleton label={t("studio:home.hero.loadingLabel")} />
      </section>
    );
  }
  if (!release) {
    return (
      <>
        <StudioHomePageHeading />
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
      </>
    );
  }

  return (
    <m.section
      className={styles.hero}
      aria-labelledby={headingId}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? REDUCED_FADE : STUDIO_FADE}
    >
      <div className={styles.heroInner}>
        <div className={styles.heroArt}>
          {/* No art yet: the wordless fallback, as on every other cover. */}
          <StudioReleaseCoverArt
            src={release.coverUrl}
            title={release.title}
            format={release.format}
            tint={release.tint}
            radius={16}
            isPriority
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
              components={{
                strong: (
                  <Link to={release.artist.href} className={kit.artistLink} />
                ),
              }}
              values={{
                artist: release.artist.name,
                facts: releaseFactsLine(release, t),
              }}
            />
          </div>
          {isShowcase && (
            <StudioHomeHeroShowcase artistName={release.artist.name} />
          )}
          <StudioHomeHeroActions key={release.id} release={release} />
        </div>
      </div>
    </m.section>
  );
}
