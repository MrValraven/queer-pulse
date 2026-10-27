import { FiList, FiSidebar } from "react-icons/fi";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayerSurface } from "../studioPlayerSurface";
import {
  STUDIO_NOW_PLAYING_BUTTON_ID,
  STUDIO_QUEUE_BUTTON_ID,
} from "./studioQueueMoves";
import styles from "../../StudioPlayer.module.css";
import { useStudioShortcutHint } from "./useStudioShortcutHint";

/** The player bar's two side panel buttons: Now playing, then the queue.
 *  Each shows its own view, and pressing the one already showing closes
 *  the panel. */
export function StudioSidePanelToggles() {
  const { t } = useTranslation();
  const surface = useStudioPlayerSurface();
  const hintFor = useStudioShortcutHint();
  const isNowPlayingShowing = surface.sidePanel === "nowPlaying";
  const nowPlayingLabel = isNowPlayingShowing
    ? t("studio:player.nowPlayingHide")
    : t("studio:player.nowPlayingShow");
  const queueLabel = surface.isQueuePanelOpen
    ? t("studio:player.queueHide")
    : t("studio:player.queueShow");
  const queueHint = hintFor(queueLabel, "queue");
  return (
    <>
      <IconButton
        id={STUDIO_NOW_PLAYING_BUTTON_ID}
        className={styles.toolButton}
        aria-expanded={isNowPlayingShowing}
        aria-label={nowPlayingLabel}
        tooltip={nowPlayingLabel}
        onClick={() => surface.toggleSidePanel("nowPlaying")}
      >
        <FiSidebar aria-hidden />
      </IconButton>
      <IconButton
        id={STUDIO_QUEUE_BUTTON_ID}
        className={styles.toolButton}
        aria-expanded={surface.isQueuePanelOpen}
        aria-label={queueLabel}
        aria-keyshortcuts={queueHint.ariaKeyShortcuts}
        tooltip={queueHint.tooltip}
        onClick={surface.toggleQueuePanel}
      >
        <FiList aria-hidden />
      </IconButton>
    </>
  );
}
