import { FiMoon, FiSliders } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button, Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayer } from "../studioPlayerContext";
import { useStudioPlayerSurface } from "../studioPlayerSurface";
import { useStudioPlayerClose } from "../useStudioPlayerClose";
import { CrossfadeSetting, LoudnessSetting } from "./StudioPlayerAudioSettings";
import { StudioPlayerPopover } from "./StudioPlayerPopover";
import { StudioSleepTimerOptions } from "./StudioSleepTimer";
import { StudioSpeedSetting } from "./StudioSpeedSetting";
import styles from "./StudioPlayerControls.module.css";
import timerStyles from "./StudioSleepTimer.module.css";

/** The bar's overflow (spec 7.1): sleep timer, crossfade, Even out
 *  loudness, Speed while an episode plays, the shortcuts sheet and Close
 *  player (the way out from inside Now playing). Inside Now playing
 *  (`onNavigate`) it also leads to the playing track's page. */
export function StudioPlayerMorePanel({
  placement,
  onNavigate,
}: {
  placement: "up" | "down";
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const surface = useStudioPlayerSurface();
  const closePlayer = useStudioPlayerClose();
  const currentItem = useStudioPlayer().currentItem;
  const isEpisode = currentItem?.isEpisode === true;
  const hasTrackPage = Boolean(currentItem && !currentItem.previewToken);
  return (
    <StudioPlayerPopover
      label={t("studio:player.more")}
      icon={FiSliders}
      placement={placement}
    >
      {(close) => (
        <>
          <p className={styles.popoverHeading}>
            {t("studio:player.sleep.heading")}
          </p>
          <StudioSleepTimerOptions onChosen={close} />
          <CrossfadeSetting />
          <LoudnessSetting />
          {/* Artist kinds: Speed shows while an episode is current. */}
          <Collapse isOpen={isEpisode}>
            <StudioSpeedSetting />
          </Collapse>
          <div className={timerStyles.panelFoot}>
            {/* Replaces the history entry, like the stage's title link. */}
            {onNavigate && (
              <Collapse isOpen={hasTrackPage}>
                <Button
                  variant="quiet"
                  className={`${styles.option} ${timerStyles.choice} ${timerStyles.goToTrackRow}`}
                  onClick={() => {
                    if (!currentItem) return;
                    close();
                    void navigate(currentItem.trackHref, { replace: true });
                    onNavigate();
                  }}
                >
                  {t("studio:player.goToTrack")}
                </Button>
              </Collapse>
            )}
            <Button
              variant="quiet"
              className={`${styles.option} ${timerStyles.choice} ${timerStyles.shortcutsRow}`}
              onClick={() => {
                close();
                surface.openShortcuts();
              }}
            >
              {t("studio:player.shortcutsCta")}
            </Button>
            <Button
              variant="quiet"
              className={`${styles.option} ${timerStyles.choice}`}
              onClick={() => {
                close();
                closePlayer();
              }}
            >
              {t("studio:playerBar.close")}
            </Button>
          </div>
        </>
      )}
    </StudioPlayerPopover>
  );
}

/** Now playing's moon on phones: the sleep timer on its own. */
export function StudioSleepTimerButton({
  placement,
}: {
  placement: "up" | "down";
}) {
  const { t } = useTranslation();
  return (
    <StudioPlayerPopover
      label={t("studio:player.sleep.heading")}
      icon={FiMoon}
      placement={placement}
    >
      {(close) => <StudioSleepTimerOptions onChosen={close} />}
    </StudioPlayerPopover>
  );
}
