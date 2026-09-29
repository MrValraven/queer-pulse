import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { TRIAGE_SHORTCUT_KEYS } from "./usePitchTriageKeys";
import styles from "./PitchTriage.module.css";

/**
 * The key hints under the card: which letter answers what and how to move.
 * Hidden on touch screens, where there is no keyboard to press them on.
 */
export function PitchTriageShortcuts() {
  const { t } = useTranslation();
  return (
    <p className={styles.shortcuts}>
      <span className="visuallyHidden">
        {t("magazine:desk.triage.shortcuts.label")}
      </span>
      <span className={styles.shortcut}>
        <kbd className={styles.kbd}>
          {TRIAGE_SHORTCUT_KEYS.maybe.toUpperCase()}
        </kbd>
        {t("magazine:desk.triage.shortcuts.maybe")}
      </span>
      <span className={styles.shortcut}>
        <kbd className={styles.kbd}>
          {TRIAGE_SHORTCUT_KEYS.pass.toUpperCase()}
        </kbd>
        {t("magazine:desk.triage.shortcuts.pass")}
      </span>
      <span className={styles.shortcut}>
        <kbd className={styles.kbd} aria-hidden>
          <FiArrowLeft />
        </kbd>
        <kbd className={styles.kbd} aria-hidden>
          <FiArrowRight />
        </kbd>
        <span className="visuallyHidden">
          {t("magazine:desk.triage.shortcuts.arrows")}
        </span>
        {t("magazine:desk.triage.shortcuts.move")}
      </span>
    </p>
  );
}

export interface PitchTriageBulkRowProps {
  selectedCount: number;
  onBulkMaybe: () => void;
  onBulkPass: () => void;
  onClearSelection: () => void;
}

/**
 * The list mode's answer row, sitting in the dialog footer. It stays in the
 * dialog's own flow so it can never cover the last pitch in the list.
 */
export function PitchTriageBulkRow({
  selectedCount,
  onBulkMaybe,
  onBulkPass,
  onClearSelection,
}: PitchTriageBulkRowProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const hasSelection = selectedCount > 0;

  return (
    <div
      className={styles.bulk}
      role="group"
      aria-label={t("magazine:desk.triage.bulkLabel")}
    >
      <span className={styles.bulkCount} aria-live="polite">
        {hasSelection ? (
          <Translation
            i18nKey="magazine:desk.triage.selected"
            values={{ count: selectedCount }}
            slots={{
              count: (
                <RollingNumber
                  value={format.number(selectedCount)}
                  numericValue={selectedCount}
                />
              ),
            }}
          />
        ) : (
          t("magazine:desk.triage.selectHint")
        )}
      </span>
      {hasSelection ? (
        <div className={styles.bulkActions}>
          <Button size="sm" variant="ghost" onClick={onBulkMaybe}>
            {t("magazine:desk.triage.maybe")}
          </Button>
          <Button size="sm" variant="ghost" onClick={onBulkPass}>
            {t("magazine:desk.triage.pass")}
          </Button>
          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            {t("magazine:desk.triage.clearSelection")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
