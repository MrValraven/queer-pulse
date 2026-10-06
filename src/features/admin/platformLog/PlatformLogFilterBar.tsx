import { useId, type RefObject } from "react";
import { FiUser, FiX } from "react-icons/fi";
import { ChipSelect, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  PLATFORM_LOG_CATEGORIES,
  PLATFORM_LOG_RANGES,
  type PlatformLogRange,
} from "./api/platformLog.api";
import type { PlatformLogFilters } from "./platformLogFilters";
import styles from "./AdminPlatformLogPage.module.css";

function isRange(value: string | null): value is PlatformLogRange {
  return (PLATFORM_LOG_RANGES as readonly (string | null)[]).includes(value);
}

export function PlatformLogFilterBar({
  filters,
  isAdmin,
  memberName,
  memberChipRef,
  filterBarRef,
  onChange,
}: {
  filters: PlatformLogFilters;
  isAdmin: boolean;
  memberName: string | null;
  /** Lets the page move focus onto the chip once a row's name is picked. */
  memberChipRef: RefObject<HTMLSpanElement | null>;
  /** Lets the page park focus on the bar once every filter is cleared. */
  filterBarRef: RefObject<HTMLDivElement | null>;
  onChange: (next: PlatformLogFilters) => void;
}) {
  const { t } = useTranslation();
  const categoryLabelId = useId();
  const categoryGroupId = useId();
  const rangeLabelId = useId();
  const rangeTriggerId = useId();
  const categoryOptions = PLATFORM_LOG_CATEGORIES.filter(
    (category) => isAdmin || category !== "members",
  ).map((category) => ({
    value: category,
    label: t(`admin:platformLog.category.${category}`),
  }));
  const rangeOptions = PLATFORM_LOG_RANGES.map((range) => ({
    value: range,
    label: t(`admin:platformLog.range.${range}`),
  }));
  const selectedCategories = new Set<string>(filters.categories);

  const toggleCategory = (value: string) => {
    const nextSelected = new Set(selectedCategories);
    if (nextSelected.has(value)) nextSelected.delete(value);
    else nextSelected.add(value);
    onChange({
      ...filters,
      categories: PLATFORM_LOG_CATEGORIES.filter((category) =>
        nextSelected.has(category),
      ),
    });
  };

  const clearMember = () => {
    // The clear button unmounts with its chip; hand focus to the category
    // group (focusable because it carries an id) before that happens.
    document.getElementById(categoryGroupId)?.focus();
    onChange({ ...filters, memberId: null });
  };

  return (
    <div
      ref={filterBarRef}
      tabIndex={-1}
      className={styles.filterBar}
      role="group"
      aria-label={t("admin:platformLog.filters.label")}
    >
      <div className={styles.filterGroup}>
        <span id={categoryLabelId} className={styles.filterLabel}>
          {t("admin:platformLog.filters.categories")}
        </span>
        <ChipSelect
          id={categoryGroupId}
          labelledBy={categoryLabelId}
          options={categoryOptions}
          selected={selectedCategories}
          onToggle={toggleCategory}
        />
      </div>
      <div className={styles.filterGroup}>
        <span id={rangeLabelId} className={styles.filterLabel}>
          {t("admin:platformLog.filters.range")}
        </span>
        <div className={styles.rangeSelect}>
          {/* Named by the visible label plus the trigger's own text, so the
              chosen range is read with it. */}
          <Select
            size="sm"
            id={rangeTriggerId}
            labelledBy={`${rangeLabelId} ${rangeTriggerId}`}
            value={filters.range}
            options={rangeOptions}
            onChange={(value) =>
              onChange({ ...filters, range: isRange(value) ? value : "all" })
            }
          />
        </div>
      </div>
      {filters.memberId ? (
        <span ref={memberChipRef} tabIndex={-1} className={styles.memberChip}>
          <FiUser aria-hidden className={styles.memberIcon} />
          <span>
            {t("admin:platformLog.filters.memberPrefix")}{" "}
            <b>{memberName ?? t("admin:platformLog.filters.memberUnknown")}</b>
          </span>
          <button
            type="button"
            className={styles.memberClear}
            aria-label={t("admin:platformLog.filters.clearMember")}
            onClick={clearMember}
          >
            <FiX aria-hidden />
          </button>
        </span>
      ) : null}
    </div>
  );
}
