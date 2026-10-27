import { useRef } from "react";
import { Button } from "../../shared/components/ui";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioListeningHistorySwitch } from "./api/useStudioListeningHistorySwitch";
import s from "./StudioListeningPage.module.css";

/**
 * Says history is paused while the switch is off, with a quick way back on.
 * It waits for the stored row, so a loading page never flashes it. When
 * "Turn history back on" folds the banner away, focus moves to the switch
 * through `onResumed` (the button it sat on is gone by then).
 */
export function StudioListeningPausedBanner({
  onResumed,
}: {
  /** Called once the banner has folded away after its own button turned history on. */
  onResumed: () => void;
}) {
  const { t } = useTranslation();
  const { isOn, isAwaitingRow, setOn } = useStudioListeningHistorySwitch();
  const shouldFocusSwitchRef = useRef(false);
  return (
    <Collapse
      isOpen={!isOn && !isAwaitingRow}
      onExitComplete={() => {
        if (!shouldFocusSwitchRef.current) return;
        shouldFocusSwitchRef.current = false;
        onResumed();
      }}
    >
      <div className={s.pausedBanner} role="status">
        <p className={s.pausedBody}>{t("studio:listening.paused.body")}</p>
        <Button
          variant="quiet"
          size="sm"
          onClick={() => {
            shouldFocusSwitchRef.current = true;
            setOn(true);
          }}
        >
          {t("studio:listening.paused.resumeCta")}
        </Button>
      </div>
    </Collapse>
  );
}
