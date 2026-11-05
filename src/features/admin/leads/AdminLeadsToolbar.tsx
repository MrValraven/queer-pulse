import { useId } from "react";
import {
  FilterChips,
  SearchInput,
  Select,
  Toggle,
  type ChipOption,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  LEAD_SEARCH_QUERY_MAX,
  LEAD_STAGES,
  LEAD_TYPES,
  isLeadStage,
  isLeadType,
  type LeadStage,
} from "./api/leads.types";
import { LEAD_STAGE_LABEL_KEY, LEAD_TYPE_LABEL_KEY } from "./leadLabels.data";
import { ALL_STAGES_CHIP } from "./leadsList.data";
import type { LeadListControls } from "./useLeadListFilters";
import styles from "./AdminLeads.module.css";

/** Typed text cut to the longest search, in code points (SearchInput takes
 *  no `maxLength`, so the cut happens here). */
function cutToSearchMax(text: string): string {
  const codePoints = Array.from(text);
  return codePoints.length > LEAD_SEARCH_QUERY_MAX
    ? codePoints.slice(0, LEAD_SEARCH_QUERY_MAX).join("")
    : text;
}

/**
 * The leads list filters: a search over name, email and links, the stage
 * chips with how many leads sit in each (All counts them all), a type
 * select and the Follow-up due switch. Counts follow the search and type,
 * so a chip says what pressing it would show. On a phone the chips scroll
 * sideways in one row.
 */
export function AdminLeadsToolbar({
  controls,
  stageCounts,
  totalCount,
}: {
  controls: LeadListControls;
  stageCounts: Record<LeadStage, number> | null;
  totalCount: number | null;
}) {
  const { t } = useTranslation();
  const stageLabelId = useId();
  const typeSelectId = useId();
  const dueToggleId = useId();
  const { filters } = controls;
  const allLabel = t("admin:leads.list.stageAll");

  const stageOptions: ChipOption[] = [
    {
      value: ALL_STAGES_CHIP,
      label: allLabel,
      count: totalCount ?? undefined,
      isUnavailable: false,
      ariaLabel:
        totalCount === null
          ? undefined
          : t("admin:leads.list.stageChipAria", {
              stage: allLabel,
              count: totalCount,
            }),
    },
    ...LEAD_STAGES.map((stage) => {
      const stageLabel = t(LEAD_STAGE_LABEL_KEY[stage]);
      const count = stageCounts?.[stage];
      return {
        value: stage,
        label: stageLabel,
        count,
        ariaLabel:
          count === undefined
            ? undefined
            : t("admin:leads.list.stageChipAria", { stage: stageLabel, count }),
      };
    }),
  ];

  return (
    <div className={styles.toolbar}>
      <SearchInput
        className={styles.search}
        value={controls.searchText}
        onChange={(text) => controls.setSearchText(cutToSearchMax(text))}
        ariaLabel={t("admin:leads.list.searchLabel")}
        placeholder={t("admin:leads.list.searchPlaceholder")}
        clearable
      />
      <div className={styles.stageGroup}>
        <span id={stageLabelId} className="visuallyHidden">
          {t("admin:leads.list.stageFilterLabel")}
        </span>
        <FilterChips
          className={styles.stageChips}
          labelledBy={stageLabelId}
          size="touch"
          options={stageOptions}
          value={filters.stage ?? ALL_STAGES_CHIP}
          onChange={(value) =>
            controls.setStage(isLeadStage(value) ? value : null)
          }
        />
      </div>
      <div className={styles.toolbarRow}>
        <div className={styles.typeFilter}>
          <Select
            id={typeSelectId}
            clearable
            label={t("admin:leads.list.typeFilterLabel")}
            placeholder={t("admin:leads.list.typeAll")}
            options={LEAD_TYPES.map((type) => ({
              value: type,
              label: t(LEAD_TYPE_LABEL_KEY[type]),
            }))}
            value={filters.type}
            onChange={(type) =>
              controls.setType(isLeadType(type) ? type : null)
            }
          />
        </div>
        <div className={styles.dueToggle}>
          <label htmlFor={dueToggleId} className={styles.dueToggleLabel}>
            {t("admin:leads.list.dueOnly")}
          </label>
          <Toggle
            id={dueToggleId}
            tone="coral"
            label={t("admin:leads.list.dueOnly")}
            checked={filters.isDueOnly}
            onChange={controls.setIsDueOnly}
          />
        </div>
      </div>
    </div>
  );
}
