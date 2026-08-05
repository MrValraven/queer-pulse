import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { WatchNotice, WatchShell } from "./CinemaWatchShell";
import { useCinemaTitle } from "./api/useCinemaTitle";
import {
  usePlaybackSession,
  useReportProgress,
} from "./api/useCinemaPlayback";
import type { PlaybackSessionDTO } from "./api/cinema.api";
import styles from "./WatchPage.module.css";
import { routes } from "../../app/routeMap";

// Persist the watch position at most this often while playing.
const PROGRESS_INTERVAL_SECONDS = 15;

/**
 * Live-mode watch experience. Fetches the real title (GET /cinema/titles/:id),
 * mints a fresh signed playback session on play (POST …/playback — never
 * cached), streams it in a real `<video>`, and persists the member's position
 * (PUT …/progress) periodically and on pause/ended. Native HLS plays on Safari
 * and iOS; a browser without native HLS support surfaces a friendly notice
 * (hls.js for Chrome/Firefox is a deferred enhancement).
 */
export function CinemaLiveWatch({ titleId }: { titleId: string | null }) {
  const { t } = useTranslation();
  const { loggedIn, checking } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastReportedRef = useRef(0);
  const [session, setSession] = useState<PlaybackSessionDTO | null>(null);
  const [playbackError, setPlaybackError] = useState(false);

  const { title, isLoading, isError } = useCinemaTitle(
    loggedIn ? titleId : null,
  );
  const playback = usePlaybackSession();
  const reportProgress = useReportProgress(titleId ?? "");

  const startPlayback = useCallback(() => {
    if (!titleId || playback.isPending) return;
    setPlaybackError(false);
    playback.mutate(titleId, {
      onSuccess: (data) => setSession(data),
      onError: () => setPlaybackError(true),
    });
  }, [playback, titleId]);

  const saveProgress = useCallback(
    (positionSeconds: number) => {
      if (!titleId || positionSeconds <= 0) return;
      lastReportedRef.current = positionSeconds;
      reportProgress.mutate(Math.floor(positionSeconds));
    },
    [reportProgress, titleId],
  );

  // Resume from the saved position once the signed source has loaded, then play.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !session) return;
    const onLoaded = () => {
      if (session.resumePositionSeconds > 0) {
        video.currentTime = session.resumePositionSeconds;
        lastReportedRef.current = session.resumePositionSeconds;
      }
      void video.play().catch(() => undefined);
    };
    video.addEventListener("loadedmetadata", onLoaded, { once: true });
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [session]);

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const current = Math.floor(video.currentTime);
    if (current - lastReportedRef.current >= PROGRESS_INTERVAL_SECONDS) {
      saveProgress(current);
    }
  };

  const flushProgress = () => {
    const video = videoRef.current;
    if (video) saveProgress(video.currentTime);
  };

  if (checking || isLoading) {
    return (
      <WatchShell>
        <div className={styles.stage} />
      </WatchShell>
    );
  }
  if (!loggedIn) {
    return (
      <WatchNotice
        titleKey="cinema:live.signIn.title"
        descKey="cinema:live.signIn.description"
        ctaKey="cinema:live.signIn.cta"
        to={routes.signIn}
      />
    );
  }
  if (!titleId) {
    return (
      <WatchNotice
        titleKey="cinema:live.pick.title"
        descKey="cinema:live.pick.description"
        ctaKey="cinema:live.pick.cta"
        to={routes.cinemaBrowse}
      />
    );
  }
  if (isError || !title) {
    return (
      <WatchNotice
        titleKey="cinema:live.notFound.title"
        descKey="cinema:live.notFound.description"
        ctaKey="cinema:live.notFound.cta"
        to={routes.cinemaBrowse}
      />
    );
  }

  return (
    <WatchShell>
      <div className={styles.stage}>
        <div className={styles.zone}>
          <div className={styles.screen}>
            {session ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption -- live studio stream; no caption track source available (demo/live).
              <video
                ref={videoRef}
                src={session.hlsUrl}
                poster={session.posterUrl}
                controls
                playsInline
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                onTimeUpdate={onTimeUpdate}
                onPause={flushProgress}
                onEnded={flushProgress}
                onError={() => setPlaybackError(true)}
              />
            ) : (
              <div className={styles.playState}>
                <span
                  role="button"
                  tabIndex={0}
                  aria-disabled={playback.isPending}
                  className={styles.playBtn}
                  aria-label={t(
                    title.resumePositionSeconds > 0
                      ? "cinema:live.resumeCta"
                      : "cinema:live.playCta",
                  )}
                  onClick={startPlayback}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      startPlayback();
                    }
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </span>
                <div className={styles.psTitle}>{title.title}</div>
                <div className={styles.psMeta}>
                  {playbackError
                    ? t("cinema:live.playbackError")
                    : title.durationLabel ?? ""}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </WatchShell>
  );
}
