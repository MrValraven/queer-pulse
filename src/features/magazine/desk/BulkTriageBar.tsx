import { BulkActionBar, Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";

export interface BulkTriageBarProps {
  /** Number of pitches currently selected. Renders nothing when 0. */
  count: number;
  onMaybe: () => void;
  onPass: () => void;
  onClear: () => void;
}

/**
 * Fixed bottom plum pill shown once one or more pitches are selected for
 * bulk triage. Thin wrapper around the shared `BulkActionBar` (same chrome
 * already used by `myevents`/admin bulk bars) — no bespoke styling of its
 * own, so it has no companion CSS module.
 */
export function BulkTriageBar({ count, onMaybe, onPass, onClear }: BulkTriageBarProps) {
  const { t } = useTranslation();
  return (
    <BulkActionBar
      count={count}
      label={t("magazine:desk.bulkTriage.selected", { count })}
      ariaLabel={t("magazine:desk.bulkTriage.ariaLabel")}
      onClear={onClear}
      clearLabel={t("magazine:desk.bulkTriage.clearSelection")}
    >
      <Button variant="ghost-dark" size="sm" onClick={onMaybe}>
        {t("magazine:desk.bulkTriage.maybe")}
      </Button>
      <Button variant="ghost-dark" size="sm" onClick={onPass}>
        {t("magazine:desk.bulkTriage.passKindly")}
      </Button>
    </BulkActionBar>
  );
}
