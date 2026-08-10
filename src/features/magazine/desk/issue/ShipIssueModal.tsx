import { Button, Modal } from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "../pieceTabs.module.css";

export interface ShipIssueModalProps {
  open: boolean;
  issueNumber: string;
  /** The publish date to name in the confirmation copy, if known (e.g. "1 September 2026"). */
  publishesLabel?: string;
  onClose: () => void;
  onShip: () => void;
}

/**
 * The ship-the-issue confirmation. Pieces still behind the publish gate are
 * not blockers here — they simply hold and publish later on their own, so
 * the modal calls that out as a warn note rather than disabling "Ship it".
 * Self-contained: renders nothing while `open` is false, matching the
 * repo's "mount modals only while open" convention even if a caller keeps
 * this mounted across the toggle.
 */
export function ShipIssueModal({
  open,
  issueNumber,
  publishesLabel,
  onClose,
  onShip,
}: ShipIssueModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  function handleShip() {
    onShip();
    onClose();
  }

  return (
    <Modal
      title={t("magazine:issue.ship.modalTitle", { number: issueNumber })}
      sub={
        publishesLabel
          ? t("magazine:issue.ship.modalSubWithDate", { date: publishesLabel })
          : t("magazine:issue.ship.modalSubNoDate")
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:issue.ship.notYet")}
          </Button>
          <Button variant="plum" onClick={handleShip}>
            {t("magazine:issue.ship.shipIt")}
          </Button>
        </>
      }
    >
      <div className={cx(styles.note, styles.warn)}>
        <span>{t("magazine:issue.ship.warnNote")}</span>
      </div>
    </Modal>
  );
}
