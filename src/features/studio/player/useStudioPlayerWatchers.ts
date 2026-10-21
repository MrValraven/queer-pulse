import { useEffect, useLayoutEffect, useRef } from "react";
import { useOnlineStatus } from "../../../shared/hooks/useOnlineStatus";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { setDocumentTitlePrefix } from "../../../shared/seo/documentTitleBadge";
import {
  OFFLINE_AUTO_RESUME_WINDOW_MS,
  readPlaybackSignals,
  setPlaybackSignals,
} from "./studioPlaybackSignals";
import { useStudioPlayer, type StudioPlayerValue } from "./studioPlayerContext";
import { useStudioPlayerSurface } from "./studioPlayerSurface";
import { announceStudioPlayer } from "./studioPlayerAnnouncer";

const TITLE_PREFIX_KEY = "studio:player.documentTitlePrefix";

/** DES-20: "Now playing {title} by {artist}" once per queue entry, when it
 *  actually starts. A cued or restored track stays quiet until Play. While
 *  Now playing is open, its own in-dialog line names the track, so this one
 *  stays silent (the entry still counts as announced) and nothing is read
 *  twice. Shortcut results still come through here. */
function useNowPlayingAnnouncement(player: StudioPlayerValue) {
  const { t } = useTranslation();
  const { isNowPlayingOpen } = useStudioPlayerSurface();
  const isNowPlayingOpenRef = useRef(isNowPlayingOpen);
  useLayoutEffect(() => {
    isNowPlayingOpenRef.current = isNowPlayingOpen;
  });
  const lastAnnouncedEntryRef = useRef<string | null>(null);
  const item = player.currentItem;
  const isPlaying = player.status === "playing";
  useEffect(() => {
    if (!item) {
      lastAnnouncedEntryRef.current = null;
      return;
    }
    if (!isPlaying || lastAnnouncedEntryRef.current === item.queueEntryId)
      return;
    lastAnnouncedEntryRef.current = item.queueEntryId;
    if (isNowPlayingOpenRef.current) return;
    announceStudioPlayer(
      t("studio:player.announce.nowPlaying", {
        title: item.title,
        artist: item.artistName,
      }),
    );
  }, [item, isPlaying, t]);
}

/**
 * DES-20: the tab reads "Playing: <page title>" while audio plays, as text
 * only. The prefix goes through the shared title module, so it sits after
 * any unread count, survives every page's own title write, and never
 * reaches the base title that the route announcer, share titles and saved
 * names read. Pausing or stopping takes it away.
 */
function usePlayingDocumentTitle(isPlaying: boolean) {
  const { t } = useTranslation();
  const prefix = isPlaying ? t(TITLE_PREFIX_KEY) : null;
  useEffect(() => {
    if (!prefix || typeof document === "undefined") return;
    setDocumentTitlePrefix(prefix);
    return () => setDocumentTitlePrefix(null);
  }, [prefix]);
}

/**
 * ENG-01: the device going offline pauses playback with the offline reason.
 * Coming back within OFFLINE_AUTO_RESUME_WINDOW_MS resumes it (or retries a
 * load the drop broke). Later than that, the pause stays and the bar asks
 * for a press of play, since the member may have moved on. A press of play
 * or pause in between (noteMemberPlayToggle) cancels the resume.
 */
function useOfflinePlayback(player: StudioPlayerValue) {
  const isOnline = useOnlineStatus();
  const playerRef = useRef(player);
  useLayoutEffect(() => {
    playerRef.current = player;
  });
  useEffect(() => {
    const current = playerRef.current;
    if (!isOnline) {
      const isActive =
        current.status === "playing" || current.status === "loading";
      if (!isActive) return;
      setPlaybackSignals({
        isPausedForOffline: true,
        offlinePausedAtMs: Date.now(),
      });
      if (current.status === "playing") current.togglePlay();
      return;
    }
    const signals = readPlaybackSignals();
    if (!signals.isPausedForOffline) return;
    const pausedForMs = Date.now() - (signals.offlinePausedAtMs ?? 0);
    const isWithinWindow = pausedForMs <= OFFLINE_AUTO_RESUME_WINDOW_MS;
    setPlaybackSignals({
      isPausedForOffline: false,
      offlinePausedAtMs: null,
      isAutoplayBlocked: !isWithinWindow && current.status === "paused",
    });
    if (!isWithinWindow) return;
    if (current.status === "paused") current.togglePlay();
    else if (current.status === "error") current.retry();
  }, [isOnline]);
}

/** The player's watchers that render nothing: the track announcement, the
 *  tab title and the offline pause. */
export function useStudioPlayerWatchers(): void {
  const player = useStudioPlayer();
  useNowPlayingAnnouncement(player);
  usePlayingDocumentTitle(player.status === "playing");
  useOfflinePlayback(player);
}
