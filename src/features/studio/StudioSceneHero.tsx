import type { Ref } from "react";
import { FiShuffle } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSceneView } from "./api/studioDiscovery.adapters";
import type { StudioReleasesResult } from "./api/useStudioReleases";
import { StudioPlayButton } from "./kit/StudioPlayButton";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { shuffledItems } from "./player/studioQueue";
import { StudioDetailHero } from "./StudioDetailHero";
import css from "./StudioScene.module.css";

/** The scene's Play: the loaded releases in a browser shuffle, each
 *  release's tracks in order. Shared by the hero and the sticky header. */
function useStudioScenePlay(releasesResult: StudioReleasesResult) {
  const player = useStudioPlayer();
  const releaseIds = releasesResult.releases.map((release) => release.id);
  const hasReleases = releaseIds.length > 0;
  return {
    hasReleases,
    play: () => {
      if (!hasReleases) return;
      void player.playReleases(shuffledItems(releaseIds));
    },
  };
}

/** Play scene as the labelled pill: it shuffles, so it says so. */
export function StudioScenePlayButton({
  releasesResult,
  size,
}: {
  releasesResult: StudioReleasesResult;
  size?: "sm" | "md";
}) {
  const { t } = useTranslation();
  const { hasReleases, play } = useStudioScenePlay(releasesResult);
  return (
    <Button
      variant="primary"
      size={size}
      aria-disabled={!hasReleases || undefined}
      onClick={play}
    >
      <FiShuffle aria-hidden /> {t("studio:scene.playCta")}
    </Button>
  );
}

/** The hero's Play: the coral round play with its words beside it, which
 *  say it shuffles. With nothing loaded it says why it waits. */
function StudioSceneHeroPlay({
  releasesResult,
}: {
  releasesResult: StudioReleasesResult;
}) {
  const { t } = useTranslation();
  const { hasReleases, play } = useStudioScenePlay(releasesResult);
  const label = t("studio:scene.playCta");
  return (
    <span className={css.heroPlay}>
      <StudioPlayButton
        state={hasReleases ? "idle" : "blocked"}
        label={label}
        blockedReason={hasReleases ? undefined : t("studio:scene.empty.title")}
        onToggle={play}
      />
      {hasReleases && (
        <span className={css.heroPlayLabel} aria-hidden="true">
          <FiShuffle /> {label}
        </span>
      )}
    </span>
  );
}

/** Cover, name, city and blurb on the shared detail hero, with Play scene
 *  over a stronger wash of the cover's tint. */
export function StudioSceneHero({
  scene,
  releasesResult,
  sentinelRef,
}: {
  scene: StudioSceneView;
  releasesResult: StudioReleasesResult;
  /** The marker the page's sticky header watches. */
  sentinelRef?: Ref<HTMLDivElement>;
}) {
  const { t } = useTranslation();
  return (
    <StudioDetailHero
      className={css.sceneHero}
      tint={scene.tint}
      sentinelRef={sentinelRef}
      art={
        <ImageSlot
          src={scene.coverUrl ?? undefined}
          tint={scene.tint}
          width="100%"
          height="100%"
          radius={16}
          placeholder={scene.name}
          style={{ position: "absolute", inset: 0 }}
          loading="eager"
          fetchPriority="high"
        />
      }
      kind={t("studio:scene.eyebrow", { city: scene.city })}
      title={scene.name}
      by={scene.blurb ? <p className={css.blurb}>{scene.blurb}</p> : null}
      actions={<StudioSceneHeroPlay releasesResult={releasesResult} />}
    />
  );
}
