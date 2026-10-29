import { AnimatePresence, m } from "motion/react";
import { FiPause, FiPlay, FiRotateCw } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, Collapse, ImageSlot } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatTrackTime } from "../api/studio.adapters";
import type { StudioLandingPreviewView } from "../api/studioLanding.adapters";
import { STUDIO_EXIT, STUDIO_FADE } from "../studioMotion";
import { STUDIO_LANDING_LISTEN_REASON_KEY } from "./studioLanding.data";
import type { StudioLandingPlayerState } from "./useStudioLandingPlayer";
import styles from "./StudioLandingListen.module.css";

const COVER_SIZE = 64;
const REDUCED_FADE = { duration: 0.12 } as const;

interface StudioLandingListenRowProps {
  preview: StudioLandingPreviewView;
  state: StudioLandingPlayerState;
  onToggle: () => void;
  onRetry: () => void;
}

/**
 * One preview: cover, title, artist, a round play button and, while it is the
 * active track, a slim progress bar. A failed attempt opens a line naming the
 * reason; every reason but "taken off this page" offers a retry.
 */
export function StudioLandingListenRow({
  preview,
  state,
  onToggle,
  onRetry,
}: StudioLandingListenRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isActive = state.activeId === preview.id;
  const isSounding =
    isActive && (state.status === "playing" || state.status === "loading");
  const failure = state.failures[preview.id] ?? null;
  const isUnavailable = failure === "unavailable";
  const trackValues = {
    track: preview.trackTitle,
    artist: preview.artist.name,
  };
  const elapsedSeconds = isActive
    ? Math.min(Math.floor(state.elapsedSeconds), preview.durationSeconds)
    : 0;
  const progressFraction =
    preview.durationSeconds > 0 ? elapsedSeconds / preview.durationSeconds : 0;
  const iconTransition = reducedMotion ? REDUCED_FADE : STUDIO_FADE;

  return (
    <div className={styles.row} data-active={isActive || undefined}>
      <ImageSlot
        src={preview.coverUrl ?? undefined}
        tint={preview.coverTint}
        initials={preview.artist.initials}
        width={COVER_SIZE}
        height={COVER_SIZE}
        radius={10}
        className={styles.cover}
      />
      <div className={styles.text}>
        <p className={styles.trackTitle}>{preview.trackTitle}</p>
        <p className={styles.artistName}>{preview.artist.name}</p>
        <Collapse isOpen={isActive}>
          <div
            className={styles.progress}
            role="progressbar"
            aria-label={preview.trackTitle}
            aria-valuemin={0}
            aria-valuemax={preview.durationSeconds}
            aria-valuenow={elapsedSeconds}
            aria-valuetext={t("studio:landing.listen.progress", {
              elapsed: formatTrackTime(elapsedSeconds) ?? "0:00",
              total: formatTrackTime(preview.durationSeconds) ?? "0:00",
            })}
          >
            <span
              className={styles.progressFill}
              style={{ transform: `scaleX(${progressFraction})` }}
            />
          </div>
        </Collapse>
        <Collapse isOpen={failure !== null}>
          <div className={styles.reason}>
            <p className={styles.reasonLine}>
              {failure ? t(STUDIO_LANDING_LISTEN_REASON_KEY[failure]) : null}
            </p>
            {failure && !isUnavailable ? (
              <Button
                variant="quiet"
                size="sm"
                className={styles.retry}
                onClick={onRetry}
              >
                <FiRotateCw aria-hidden="true" />
                {t("studio:landing.listen.retry", trackValues)}
              </Button>
            ) : null}
          </div>
        </Collapse>
      </div>
      <Button
        variant="primary"
        className={styles.play}
        aria-label={t(
          isSounding
            ? "studio:landing.listen.pause"
            : "studio:landing.listen.play",
          trackValues,
        )}
        aria-disabled={isUnavailable || undefined}
        aria-busy={(isActive && state.status === "loading") || undefined}
        onClick={() => {
          if (!isUnavailable) onToggle();
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <m.span
            key={isSounding ? "pause" : "play"}
            className={styles.playIcon}
            aria-hidden="true"
            initial={
              reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              transition: reducedMotion ? REDUCED_FADE : STUDIO_EXIT,
            }}
            transition={iconTransition}
          >
            {isSounding ? <FiPause /> : <FiPlay />}
          </m.span>
        </AnimatePresence>
      </Button>
    </div>
  );
}
