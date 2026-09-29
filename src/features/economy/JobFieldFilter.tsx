import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  JOB_FIELD_GROUPS,
  fieldLabelKey,
  jobFieldGroupLabelKey,
  type JobFieldGroupId,
} from "../members/workTaxonomy.data";
import styles from "./JobsPage.module.css";

export interface JobFieldFilterValue {
  /** The selected field group; null shows every role. */
  groupId: JobFieldGroupId | null;
  /** One field inside the group; null matches any field in it. */
  fieldId: string | null;
}

interface JobFieldFilterProps extends JobFieldFilterValue {
  onChange: (next: JobFieldFilterValue) => void;
}

interface FilterChipOption {
  id: string;
  label: string;
  isActive: boolean;
  onSelect: () => void;
}

interface FilterChipRowProps {
  options: FilterChipOption[];
  /** The field row: smaller chips with a tinted pressed state. */
  isSubordinate?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

function targetIndexForKey(key: string, index: number, lastIndex: number) {
  if (key === "ArrowRight") return index === lastIndex ? 0 : index + 1;
  if (key === "ArrowLeft") return index === 0 ? lastIndex : index - 1;
  if (key === "Home") return 0;
  if (key === "End") return lastIndex;
  return null;
}

/**
 * One row of toggle chips. The row is a single tab stop (roving tabindex):
 * the pressed chip holds it, arrows and Home/End move focus along the row, and
 * Enter/Space press the focused chip as any native button does. On a phone the
 * row is a horizontal scroller, so the pressed chip is scrolled into view when
 * the row mounts and whenever the pressed chip changes.
 */
function FilterChipRow({
  options,
  isSubordinate = false,
  ariaLabel,
  ariaLabelledBy,
}: FilterChipRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.isActive),
  );
  const tabStopIndex =
    focusedIndex !== null && focusedIndex < options.length
      ? focusedIndex
      : activeIndex;

  // Scrolls the row only along its own inline axis: scrollIntoView would also
  // scroll the page when the filter sits below the fold on load.
  useEffect(() => {
    const row = rowRef.current;
    const chip = chipRefs.current[activeIndex];
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return;
    const inset = parseFloat(getComputedStyle(row).scrollPaddingInlineStart);
    const safeInset = Number.isFinite(inset) ? inset : 0;
    const rowBox = row.getBoundingClientRect();
    const chipBox = chip.getBoundingClientRect();
    const overflowStart = chipBox.left - (rowBox.left + safeInset);
    const overflowEnd = chipBox.right - (rowBox.right - safeInset);
    let offset = 0;
    if (overflowStart < 0) offset = overflowStart;
    else if (overflowEnd > 0) offset = overflowEnd;
    if (offset === 0) return;
    row.scrollBy({
      left: offset,
      behavior: prefersReducedMotionNow() ? "auto" : "smooth",
    });
  }, [activeIndex]);

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const targetIndex = targetIndexForKey(event.key, index, options.length - 1);
    if (targetIndex === null) return;
    event.preventDefault();
    chipRefs.current[targetIndex]?.focus();
  }

  const activeClass = isSubordinate ? styles.chipSubActive : styles.chipActive;

  return (
    <div
      ref={rowRef}
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={styles.filters}
      onBlur={(event) => {
        // Focus leaving the row hands the tab stop back to the pressed chip.
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusedIndex(null);
        }
      }}
    >
      {options.map((option, index) => (
        <button
          key={option.id}
          ref={(element) => {
            chipRefs.current[index] = element;
          }}
          type="button"
          aria-pressed={option.isActive}
          tabIndex={index === tabStopIndex ? 0 : -1}
          className={[
            styles.chip,
            isSubordinate && styles.chipSub,
            option.isActive && activeClass,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={option.onSelect}
          onFocus={() => setFocusedIndex(index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The jobs board's field filter. The first row picks one of the nine field
 * groups; once a group is picked, a quieter second row narrows it to a single
 * field. Picking a group clears the field, and picking the active group again
 * goes back to every role.
 */
export function JobFieldFilter({
  groupId,
  fieldId,
  onChange,
}: JobFieldFilterProps) {
  const { t } = useTranslation();
  const fieldsLabelId = useId();
  const selectedGroup = groupId
    ? JOB_FIELD_GROUPS.find((group) => group.id === groupId)
    : undefined;

  const groupOptions: FilterChipOption[] = [
    {
      id: "all",
      label: t("economy:jobs.filter.all"),
      isActive: groupId === null,
      onSelect: () => onChange({ groupId: null, fieldId: null }),
    },
    ...JOB_FIELD_GROUPS.map((group) => ({
      id: group.id,
      label: t(jobFieldGroupLabelKey(group.id)),
      isActive: group.id === groupId,
      onSelect: () =>
        onChange({
          groupId: group.id === groupId ? null : group.id,
          fieldId: null,
        }),
    })),
  ];

  const fieldOptions: FilterChipOption[] = selectedGroup
    ? [
        {
          id: "any",
          label: t("economy:jobs.fieldFilter.anyField"),
          isActive: fieldId === null,
          onSelect: () => onChange({ groupId, fieldId: null }),
        },
        ...selectedGroup.fieldIds.map((field) => ({
          id: field,
          label: t(fieldLabelKey(field)),
          isActive: field === fieldId,
          onSelect: () => onChange({ groupId, fieldId: field }),
        })),
      ]
    : [];

  return (
    <div className={styles.fieldFilter}>
      <FilterChipRow
        ariaLabel={t("economy:jobs.fieldFilter.groupsLabel")}
        options={groupOptions}
      />
      {selectedGroup && (
        <div className={styles.fieldRow}>
          <span id={fieldsLabelId} className={styles.fieldLead}>
            {t("economy:jobs.fieldFilter.fieldsLabel")}
          </span>
          <FilterChipRow
            key={selectedGroup.id}
            ariaLabelledBy={fieldsLabelId}
            isSubordinate
            options={fieldOptions}
          />
        </div>
      )}
    </div>
  );
}
