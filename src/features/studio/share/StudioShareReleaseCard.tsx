import { useId } from "react";
import { AnimatePresence } from "motion/react";
import { FiCalendar } from "react-icons/fi";
import { ImageSlot } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "../api/studio.adapters";
import { useStudioHideExplicit } from "../api/useStudioPlaybackPreferences";
import { useStudioRelease } from "../api/useStudioRelease";
import { useStudioPlayer } from "../player/studioPlayerContext";
import { outDateOf } from "../studioUpcoming";
import { StudioShareCardBody } from "./StudioShareCardBody";
import {
  StudioShareCardLayer,
  StudioShareCardStatusBody,
} from "./StudioShareCardStates";
import { studioLinkPath, type StudioLinkTarget } from "./studioLinkTarget";
import {
  GRANTED_ACCESS,
  releasePlayModel,
  studioShareCardStatus,
} from "./studioShareCardModel";
import styles from "./StudioShareCard.module.css";

/** A shared release (or show): plays from the top, skipping tracks the
 *  member hides; an upcoming release shows its date and no play. */
export function StudioShareReleaseCard({
  target,
}: {
  target: StudioLinkTarget;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const player = useStudioPlayer();
  const hideExplicit = useStudioHideExplicit();
  const noteId = useId();
  const { release, loadState } = useStudioRelease(target.id, {
    shouldUseDemoDefault: false,
  });
  const status = studioShareCardStatus(
    GRANTED_ACCESS,
    loadState,
    release !== null,
  );
  let readyBody = null;
  if (status === "ready" && release) {
    const model = releasePlayModel(release, hideExplicit);
    const isCurrent = player.isCurrentRelease(release.id);
    const isPlaying = isCurrent && player.status === "playing";
    const isHidden = model.playMode === "hidden";
    // Called synchronously inside the click, so the audio context unlocks.
    const play = () => {
      // A hidden track already playing can still be paused from here.
      if (!isPlaying && model.playMode !== "playable") return;
      if (isCurrent) player.togglePlay();
      else if (model.hasHiddenTrack) void player.playTracks(model.queue);
      else void player.playRelease(release.id);
    };
    const outOn =
      model.playMode === "scheduled"
        ? outDateOf(release.publishAt, formatters)
        : null;
    const meta = isHidden ? (
      <span id={noteId}>{t("studio:share.card.hiddenNote")}</span>
    ) : model.playMode === "scheduled" ? (
      <>
        <FiCalendar aria-hidden className={styles.metaIcon} />
        {outOn
          ? t("studio:upcoming.outOn", outOn)
          : t("studio:upcoming.cardHeading")}
      </>
    ) : (
      releaseFacts(release, t)
    );
    readyBody = (
      <StudioShareCardBody
        kind="release"
        href={studioLinkPath(target)}
        title={release.title}
        subtitle={release.artist.name}
        meta={meta}
        art={
          <ImageSlot
            src={release.coverUrl ?? undefined}
            tint={release.tint}
            width="100%"
            height="100%"
            // The cover box clips to the concentric corner.
            radius={0}
            placeholder=""
            style={{ position: "absolute", inset: 0 }}
          />
        }
        play={
          model.playMode === "playable" || isHidden
            ? {
                isPlaying,
                isBlocked: isHidden && !isPlaying,
                noteId,
                label: t(
                  isPlaying
                    ? "studio:card.pauseRelease"
                    : "studio:card.playRelease",
                  { title: release.title },
                ),
                onPlay: play,
              }
            : null
        }
      />
    );
  }
  return (
    <AnimatePresence initial={false}>
      <StudioShareCardLayer key={readyBody ? "ready" : status}>
        {readyBody ?? (
          <StudioShareCardStatusBody
            status={status === "ready" ? "loading" : status}
          />
        )}
      </StudioShareCardLayer>
    </AnimatePresence>
  );
}

/** "EP · 3 tracks · 10 min", as the release hero reads it. */
function releaseFacts(
  release: StudioReleaseView,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  const minutes = Math.round(release.totalDurationSeconds / 60);
  return [
    t(release.typeLabelKey),
    t(
      release.isShow ? "studio:facts.episodeCount" : "studio:facts.trackCount",
      {
        count: release.trackCount,
      },
    ),
    minutes > 0 ? t("studio:facts.minutes", { count: minutes }) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
