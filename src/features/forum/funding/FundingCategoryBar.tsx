import { useId, type ReactNode } from "react";
import { Button, ChipSelect, FilterChips } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  CALL_LIST_VIEWS,
  ELIGIBILITY_LABEL_KEYS,
  FUNDING_ELIGIBILITIES,
  FUNDING_LIST_VIEWS,
  FUNDING_SCOPES,
  LIST_VIEW_LABEL_KEYS,
  SCOPE_LABEL_KEYS,
  parseEligibility,
  parseFundingListView,
  parseScope,
} from "./funding.data";
import type {
  FundingEligibility,
  FundingListView,
  FundingScope,
} from "./funding.types";
import styles from "./FundingCategoryBar.module.css";

/** The "anywhere" chip's value; never sent to the server. */
const ANY_SCOPE = "any";

export interface FundingCategoryBarProps {
  view: FundingListView;
  onViewChange: (view: FundingListView) => void;
  eligibility: readonly FundingEligibility[];
  onToggleEligibility: (value: FundingEligibility) => void;
  scope: FundingScope | null;
  onScopeChange: (scope: FundingScope | null) => void;
  onClearFilters: () => void;
  /** Task 19 puts "Follow new calls" here. */
  followSlot?: ReactNode;
}

/**
 * The views and filters of Funding & Grants, above the thread list. Every
 * choice lives in the URL (see `useForumUrlParams`), so a shared link or Back
 * from a thread lands on the same slice.
 */
export function FundingCategoryBar({
  view,
  onViewChange,
  eligibility,
  onToggleEligibility,
  scope,
  onScopeChange,
  onClearFilters,
  followSlot,
}: FundingCategoryBarProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const eligibilityLabelId = useId();
  const scopeLabelId = useId();
  const isCallView = CALL_LIST_VIEWS.includes(view);
  const hasFilters = eligibility.length > 0 || scope !== null;

  return (
    <section className={styles.bar} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h2 id={headingId} className={styles.heading}>
          {t("forum:funding.view.heading")}
        </h2>
        {followSlot}
      </div>
      <FilterChips
        options={FUNDING_LIST_VIEWS.map((value) => ({
          value,
          label: t(LIST_VIEW_LABEL_KEYS[value]),
        }))}
        value={view}
        onChange={(next) => onViewChange(parseFundingListView(next))}
        labelledBy={headingId}
        size="touch"
        className={styles.chips}
      />
      {isCallView && (
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <span id={eligibilityLabelId} className={styles.filterLabel}>
              {t("forum:funding.filter.eligibilityLabel")}
            </span>
            <ChipSelect
              options={FUNDING_ELIGIBILITIES.map((value) => ({
                value,
                label: t(ELIGIBILITY_LABEL_KEYS[value]),
              }))}
              selected={new Set(eligibility)}
              onToggle={(value) => {
                const [known] = parseEligibility([value]);
                if (known) onToggleEligibility(known);
              }}
              labelledBy={eligibilityLabelId}
              size="touch"
              className={styles.chips}
            />
          </div>
          <div className={styles.filterGroup}>
            <span id={scopeLabelId} className={styles.filterLabel}>
              {t("forum:funding.filter.scopeLabel")}
            </span>
            <FilterChips
              options={[
                { value: ANY_SCOPE, label: t("forum:funding.filter.anyScope") },
                ...FUNDING_SCOPES.map((value) => ({
                  value,
                  label: t(SCOPE_LABEL_KEYS[value]),
                })),
              ]}
              value={scope ?? ANY_SCOPE}
              onChange={(next) =>
                onScopeChange(next === ANY_SCOPE ? null : parseScope(next))
              }
              labelledBy={scopeLabelId}
              size="touch"
              className={styles.chips}
            />
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className={styles.clear}
              onClick={onClearFilters}
            >
              {t("forum:funding.filter.clear")}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
