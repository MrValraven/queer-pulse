import { BulkActionBar, Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";

export interface BulkAssignBarProps {
  /** Number of pieces currently selected. Renders nothing when 0. */
  count: number;
  /** Opens the shared `AssignIssueModal` for the whole selection. */
  onAssign: () => void;
  onClear: () => void;
}

/**
 * Fixed bottom plum pill shown once one or more pipeline rows are selected,
 * offering to file the whole selection onto an issue in one request. Thin
 * wrapper around the shared `BulkActionBar`, exactly like `BulkTriageBar`
 * does for the pitch inbox — no bespoke styling, so no companion CSS module.
 */
export function BulkAssignBar({ count, onAssign, onClear }: BulkAssignBarProps) {
  const { t } = useTranslation();
  return (
    <BulkActionBar
      count={count}
      label={t("magazine:desk.bulkAssign.selected", { count })}
      ariaLabel={t("magazine:desk.bulkAssign.ariaLabel")}
      onClear={onClear}
      clearLabel={t("magazine:desk.bulkAssign.clearSelection")}
    >
      <Button variant="ghost-dark" size="sm" onClick={onAssign}>
        {t("magazine:desk.bulkAssign.assignToIssue")}
      </Button>
    </BulkActionBar>
  );
}
