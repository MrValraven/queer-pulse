import { useId, useState } from "react";
import {
  Collapse,
  DatePicker,
  type DateRange,
} from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { featureUsageErrorKey } from "./api/featureUsageErrorCode";
import {
  FEATURE_USAGE_PRESET_RANGE_DAYS,
  addUtcDays,
  earliestCustomRangeDay,
  formatDayRange,
  validateCustomRange,
  yesterdayUtcDay,
  type FeatureUsagePresetRangeDays,
  type FeatureUsageRangeSelection,
  type FeatureUsageWindow,
} from "./featureUsageRange";
import { AdminSeg } from "./ui";
import styles from "./FeatureUsageRangeControl.module.css";

const CUSTOM_OPTION = "custom";

interface FeatureUsageRangeControlProps {
  selection: FeatureUsageRangeSelection;
  onSelectionChange: (selection: FeatureUsageRangeSelection) => void;
  /** The range the backend resolved for the data on screen, null until the
   *  first response lands. */
  window: FeatureUsageWindow | null;
}

/** The days a custom draft starts from: the applied custom days, or the
 *  window on screen for a preset. Before the first response (or while the
 *  window still describes an older preset) the preset's days are worked out
 *  the way the backend does: it ends yesterday and spans `rangeDays` days. */
function draftFor(
  selection: FeatureUsageRangeSelection,
  usageWindow: FeatureUsageWindow | null,
): DateRange {
  if (selection.kind === "custom") {
    return { start: selection.from, end: selection.to };
  }
  if (usageWindow && usageWindow.rangeDays === selection.rangeDays) {
    return { start: usageWindow.rangeStart, end: usageWindow.rangeEnd };
  }
  const latestDay = yesterdayUtcDay();
  return {
    start: addUtcDays(latestDay, 1 - selection.rangeDays),
    end: latestDay,
  };
}

function isSameCustomRange(
  selection: FeatureUsageRangeSelection,
  fromDay: string,
  toDay: string,
): boolean {
  return (
    selection.kind === "custom" &&
    selection.from === fromDay &&
    selection.to === toDay
  );
}

/**
 * The range picker above the feature usage table: three presets plus a
 * Custom option that folds open a from/to date picker. A custom draft only
 * reaches the page (and so the network) once it passes the same limits the
 * backend checks; until then a polite live message names what is wrong.
 * The summary line underneath always states which days are on screen and
 * which earlier days they are measured against; when retention has already
 * dropped part of those earlier days, a quieter line under it says the
 * comparison runs low.
 */
export function FeatureUsageRangeControl({
  selection,
  onSelectionChange,
  window: usageWindow,
}: FeatureUsageRangeControlProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const rangeLabelId = useId();
  const customLabelId = useId();
  const hintId = useId();
  const issueId = useId();
  const [isCustomOpen, setIsCustomOpen] = useState(selection.kind === "custom");
  const [draft, setDraft] = useState<DateRange>(() =>
    draftFor(selection, usageWindow),
  );

  const isCustomShown = isCustomOpen || selection.kind === "custom";
  const earliestDay = usageWindow?.retentionStart ?? earliestCustomRangeDay();
  const latestDay = yesterdayUtcDay();
  const issue = isCustomShown
    ? validateCustomRange(draft.start, draft.end, { earliestDay, latestDay })
    : null;
  // A draft with one date picked is still being chosen: the hint guides it,
  // so it shows no error and stays unapplied until the second date lands.
  const shownIssue = issue === "rangeIncomplete" ? null : issue;

  const handleSegChange = (value: string) => {
    if (value === CUSTOM_OPTION) {
      if (!isCustomShown) setDraft(draftFor(selection, usageWindow));
      setIsCustomOpen(true);
      return;
    }
    setIsCustomOpen(false);
    const rangeDays = Number(value) as FeatureUsagePresetRangeDays;
    if (selection.kind !== "preset" || selection.rangeDays !== rangeDays) {
      onSelectionChange({ kind: "preset", rangeDays });
    }
  };

  const handleDraftChange = (next: DateRange | null) => {
    const nextDraft = next ?? { start: null, end: null };
    setDraft(nextDraft);
    const nextIssue = validateCustomRange(nextDraft.start, nextDraft.end, {
      earliestDay,
      latestDay,
    });
    if (nextIssue !== null || !nextDraft.start || !nextDraft.end) return;
    if (isSameCustomRange(selection, nextDraft.start, nextDraft.end)) return;
    onSelectionChange({
      kind: "custom",
      from: nextDraft.start,
      to: nextDraft.end,
    });
  };

  const segOptions = [
    ...FEATURE_USAGE_PRESET_RANGE_DAYS.map((rangeDays) => ({
      value: String(rangeDays),
      label: t(`admin:featureUsage.range.d${rangeDays}`),
    })),
    { value: CUSTOM_OPTION, label: t("admin:featureUsage.range.custom") },
  ];
  const segValue =
    selection.kind === "custom" || isCustomOpen
      ? CUSTOM_OPTION
      : String(selection.rangeDays);

  return (
    <div className={styles.control}>
      <div className={styles.row}>
        <span id={rangeLabelId} className={styles.label}>
          {t("admin:featureUsage.rangeLabel")}
        </span>
        <AdminSeg
          options={segOptions}
          value={segValue}
          onChange={handleSegChange}
          ariaLabelledby={rangeLabelId}
          className={styles.rangeSeg}
        />
      </div>

      <Collapse isOpen={isCustomShown}>
        <div className={styles.customPanel}>
          <span id={customLabelId} className={styles.label}>
            {t("admin:featureUsage.range.customLabel")}
          </span>
          <DatePicker
            mode="range"
            size="sm"
            labelledBy={customLabelId}
            value={draft}
            onChange={handleDraftChange}
            min={earliestDay}
            max={latestDay}
            invalid={shownIssue !== null}
            aria-describedby={`${hintId} ${issueId}`}
          />
          <p id={hintId} className={styles.hint}>
            {t("admin:featureUsage.range.customHint")}
          </p>
          <div id={issueId} aria-live="polite">
            <Collapse isOpen={shownIssue !== null}>
              <p className={styles.issue}>
                {shownIssue ? t(featureUsageErrorKey(shownIssue)) : null}
              </p>
            </Collapse>
          </div>
        </div>
      </Collapse>

      {usageWindow ? (
        <p className={styles.summary}>
          {t("admin:featureUsage.range.summary", {
            current: formatDayRange(
              usageWindow.rangeStart,
              usageWindow.rangeEnd,
              fmt,
              t,
            ),
            previous: formatDayRange(
              usageWindow.previousRangeStart,
              usageWindow.previousRangeEnd,
              fmt,
              t,
            ),
          })}
        </p>
      ) : null}
      <Collapse isOpen={usageWindow?.isPreviousRangePartial === true}>
        <p className={styles.partialNote}>
          {t("admin:featureUsage.range.previousPartial")}
        </p>
      </Collapse>
    </div>
  );
}
