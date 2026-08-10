import { FiCheck, FiX } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { PublishGateItemDto } from "../../api/pieces.api";
import styles from "../pieceTabs.module.css";

export interface ShipChecklistCardProps {
  checklist: PublishGateItemDto[];
  onShip: () => void;
}

/**
 * The pre-ship checklist in the issue-production `.erail`: every ✓/✗ item
 * from `IssueProductionDto.shipChecklist` (past-gate pieces, cover licensed,
 * coverlines proofed, contents blurbs, digest scheduled, corrections carried
 * over), plus the "Ship the issue" button that opens `ShipIssueModal`. This
 * card is advisory only — unlike `PublishGateCard`, the button is never
 * disabled: the modal itself is where a still-open checklist is surfaced
 * (via the "pieces behind the gate hold and publish later" warn note), so an
 * editor can still ship on purpose with open items.
 */
export function ShipChecklistCard({ checklist, onShip }: ShipChecklistCardProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.card}>
      <h3>{t("magazine:issue.ship.checklistHeading")}</h3>
      <div className={styles.stack}>
        {checklist.map((item) => (
          <div key={item.label} className={cx(styles.gaterow, !item.done && styles.open)}>
            {item.done ? (
              <FiCheck className={styles.doneIcon} aria-hidden />
            ) : (
              <FiX className={styles.openIcon} aria-hidden />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <Button variant="plum" onClick={onShip}>
        {t("magazine:issue.ship.cta")}
      </Button>
    </div>
  );
}
