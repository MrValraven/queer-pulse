import { useCallback, useEffect, useState } from "react";
import {
  SEEK_HOLD_TIMEOUT_MS,
  shouldAnnounceSeek,
  shouldReleaseSeekHold,
  type StudioSeekHold,
} from "./studioSeekDisplay";

export interface StudioSeekDisplay {
  /** What the labels and the playhead show: the preview, the held seek or the clock. */
  displaySeconds: number;
  /** The drag or key preview, null at rest. */
  previewSeconds: number | null;
  /** A committed seek the clock has not confirmed yet. */
  heldSeconds: number | null;
  /** True while the shown time follows the member's own input or a pause. */
  isExact: boolean;
  /** The time the slider speaks, stepped during steady playback. */
  announcedSeconds: number;
  handlePreviewChange: (previewValue: number | null) => void;
  handleCommit: (seconds: number) => void;
}

/** The seek bar's shown time. A committed seek holds the playhead on its
 *  target until the clock gets there, so the bar never snaps back to the
 *  old time first. Another control's seek and a new track drop the hold. */
export function useStudioSeekDisplay({
  clockSeconds,
  clockSeekCount,
  isPlaying,
  trackKey,
  onSeek,
}: {
  clockSeconds: number;
  /** The clock's count of seeks so far. */
  clockSeekCount: number;
  isPlaying: boolean;
  trackKey: string | null;
  onSeek: (seconds: number) => void;
}): StudioSeekDisplay {
  const [previewSeconds, setPreviewSeconds] = useState<number | null>(null);
  const [hold, setHold] = useState<StudioSeekHold | null>(null);
  const [announcedSeconds, setAnnouncedSeconds] = useState(clockSeconds);
  const [appliedTrackKey, setAppliedTrackKey] = useState(trackKey);

  let activePreview = previewSeconds;
  let activeHold = hold;
  const isNewTrack = appliedTrackKey !== trackKey;
  if (isNewTrack) {
    setAppliedTrackKey(trackKey);
    setPreviewSeconds(null);
    setHold(null);
    setAnnouncedSeconds(clockSeconds);
    activePreview = null;
    activeHold = null;
  } else if (
    hold &&
    shouldReleaseSeekHold(hold, { clockSeconds, clockSeekCount, isPlaying })
  ) {
    setHold(null);
    activeHold = null;
  }

  const displaySeconds =
    activePreview ?? activeHold?.targetSeconds ?? clockSeconds;
  const isExact = activePreview !== null || activeHold !== null || !isPlaying;
  if (
    !isNewTrack &&
    shouldAnnounceSeek(announcedSeconds, displaySeconds, isExact)
  ) {
    setAnnouncedSeconds(displaySeconds);
  }

  // A seek the clock never confirms lets the playhead go back to the clock.
  useEffect(() => {
    if (!hold) return;
    const delayMs = Math.max(
      0,
      hold.startedAtMs + SEEK_HOLD_TIMEOUT_MS - Date.now(),
    );
    const timer = window.setTimeout(() => {
      setHold((current) => (current === hold ? null : current));
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [hold]);

  const handlePreviewChange = useCallback((previewValue: number | null) => {
    setPreviewSeconds(previewValue);
  }, []);

  const handleCommit = useCallback(
    (seconds: number) => {
      onSeek(seconds);
      // This seek lands one count past the latest one this bar knows of.
      setHold((previous) => ({
        targetSeconds: seconds,
        originSeconds: clockSeconds,
        startedAtMs: Date.now(),
        expectedSeekCount:
          Math.max(clockSeekCount, previous?.expectedSeekCount ?? 0) + 1,
      }));
    },
    [clockSeconds, clockSeekCount, onSeek],
  );

  return {
    displaySeconds,
    previewSeconds: activePreview,
    heldSeconds: activeHold?.targetSeconds ?? null,
    isExact,
    announcedSeconds: isNewTrack ? clockSeconds : announcedSeconds,
    handlePreviewChange,
    handleCommit,
  };
}
