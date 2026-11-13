/**
 * The flash warning (design decision 4), anchored on the pad that asked. The
 * first flash-capable effect, transition or strobe of a show waits here for
 * a second tap; R26 holds the request (`actions.flashConsent`) and R27
 * renders this popover for it. Keep it off comes first, so the focus the
 * popover lands on is the safe choice. It paints over the remote's sheets,
 * since a switch in the Effects sheet can ask for it. A sequence that plays
 * by itself asks once for all its flashing steps, so its confirm names the
 * sequence (vj:flash.sequenceConfirm).
 */
import { useId, type RefObject } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VjDockPopover } from "../kit/VjDockPopover";
import styles from "./VjPads.module.css";

export interface VjFlashConsentPopoverProps {
  anchorRef: RefObject<HTMLElement | null>;
  /** The effect's display name, for the confirm button. */
  effectLabel: string;
  /** Set when a sequence asked (`VjFlashConsentRequest.setlistName`): the confirm names it instead. */
  setlistName?: string | null;
  isOpen: boolean;
  onConsent: () => void;
  onClose: () => void;
}

export function VjFlashConsentPopover({
  anchorRef,
  effectLabel,
  setlistName = null,
  isOpen,
  onConsent,
  onClose,
}: VjFlashConsentPopoverProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const warningId = useId();
  return (
    <VjDockPopover
      anchorRef={anchorRef}
      isOpen={isOpen}
      onClose={onClose}
      labelledBy={titleId}
      className={styles.popover}
      isOverSheets
    >
      <div className={styles.popoverHead} data-vj-flash-consent="">
        <h2 id={titleId} className={styles.popoverTitle}>
          <FiAlertTriangle
            aria-hidden
            fill="none"
            className={styles.titleIcon}
          />
          {t("vj:flash.warningTitle")}
        </h2>
      </div>
      <p id={warningId} className={styles.warning}>
        {t("vj:effects.strobeWarning")}
      </p>
      <div className={styles.consentActions}>
        <Button type="button" variant="stage-ghost" size="md" onClick={onClose}>
          {setlistName === null
            ? t("vj:flash.cancel")
            : t("vj:flash.sequenceCancel", { name: setlistName })}
        </Button>
        <Button
          type="button"
          variant="stage"
          size="md"
          aria-describedby={warningId}
          onClick={onConsent}
        >
          {setlistName === null
            ? t("vj:flash.confirm", { effect: effectLabel })
            : t("vj:flash.sequenceConfirm", { name: setlistName })}
        </Button>
      </div>
    </VjDockPopover>
  );
}
