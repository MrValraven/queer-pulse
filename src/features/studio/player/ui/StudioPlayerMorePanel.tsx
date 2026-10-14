import { FiMoon, FiMoreHorizontal } from "react-icons/fi";
import { Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayer } from "../studioPlayerContext";
import { useStudioPlayerSurface } from "../studioPlayerSurface";
import { useStudioPlayerClose } from "../useStudioPlayerClose";
import { CrossfadeSetting, LoudnessSetting } from "./StudioPlayerAudioSettings";
import { StudioPlayerPopover } from "./StudioPlayerPopover";
import { StudioSleepTimerOptions } from "./StudioSleepTimer";
import { StudioSpeedSetting } from "./StudioSpeedSetting";
import styles from "./StudioPlayerControls.module.css";

/** The bar's overflow (spec 7.1): sleep timer, crossfade, Even out
 *  loudness, Speed while an episode plays, the shortcuts sheet and Close
 *  player (the way out from inside Now playing). */
export function StudioPlayerMorePanel({
  placement,
}: {
  placement: "up" | "down";
}) {
  const { t } = useTranslation();
  const surface = useStudioPlayerSurface();
  const closePlayer = useStudioPlayerClose();
  const isEpisode = useStudioPlayer().currentItem?.isEpisode === true;
  return (
    <StudioPlayerPopover
      label={t("studio:player.more")}
      icon={FiMoreHorizontal}
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
          <button
            type="button"
            className={styles.option}
            onClick={() => {
              close();
              surface.openShortcuts();
            }}
          >
            {t("studio:player.shortcutsCta")}
          </button>
          <button
            type="button"
            className={styles.option}
            onClick={() => {
              close();
              closePlayer();
            }}
          >
            {t("studio:playerBar.close")}
          </button>
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
