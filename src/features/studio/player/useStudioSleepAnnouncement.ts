import { useEffect, useRef } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { announceStudioPlayer } from "./studioPlayerAnnouncer";
import type { StudioSleepTimerState } from "./studioPlayerContext";

const timerKey = (timer: StudioSleepTimerState) =>
  !timer
    ? "off"
    : timer.kind === "minutes"
      ? `minutes:${timer.endsAt}`
      : "endOfTrack";

/** One sentence per timer change, compared by content, so clock ticks and
 *  re-renders with an equal value stay silent. It speaks through the
 *  player's body-level live region (Now playing repeats it inside its
 *  dialog), so a timer that ends while no chip is mounted, such as on a
 *  phone with Now playing closed, is still heard, and a chip that leaves
 *  with Now playing never repeats it. */
export function useStudioSleepAnnouncement(
  timer: StudioSleepTimerState,
  isEpisode: boolean,
): void {
  const { t } = useTranslation();
  const previousKeyRef = useRef(timerKey(timer));
  useEffect(() => {
    const key = timerKey(timer);
    if (key === previousKeyRef.current) return;
    previousKeyRef.current = key;
    if (!timer) {
      announceStudioPlayer(t("studio:player.sleep.cancelledStatus"));
      return;
    }
    if (timer.kind === "endOfTrack") {
      announceStudioPlayer(
        t(
          isEpisode
            ? "studio:player.sleep.endOfEpisodeStatus"
            : "studio:player.sleep.endOfTrackStatus",
        ),
      );
      return;
    }
    announceStudioPlayer(
      t("studio:player.sleep.setStatus", {
        minutes: Math.max(1, Math.round((timer.endsAt - Date.now()) / 60000)),
      }),
    );
  }, [timer, isEpisode, t]);
}
