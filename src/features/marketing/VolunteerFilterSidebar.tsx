import { useId } from "react";
import {
  FilterOptionRow,
  FilterSection,
  FilterSidebarPanel,
} from "../../shared/components/filterPage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ANY_OPTION,
  CAUSE_OPTIONS,
  COMMITMENT_OPTIONS,
  type CauseChoice,
  type CommitmentChoice,
  type VolunteerFilterOption,
} from "./volunteerPage.data";
import type { VolunteerFilterSectionKey } from "./volunteerFilterSections";

export interface VolunteerFilterSidebarProps {
  /** Rendered inside the mobile `FiltersSheet`. */
  isInSheet?: boolean;
  commitment: CommitmentChoice;
  onCommitmentChange: (commitment: CommitmentChoice) => void;
  cause: CauseChoice;
  onCauseChange: (cause: CauseChoice) => void;
  /** Opportunities each commitment row would leave. Undefined while the
   *  facets are not counted, which draws no number. */
  commitmentCounts: Partial<Record<CommitmentChoice, number>> | undefined;
  /** Opportunities each cause row would leave, on the same terms. */
  causeCounts: Partial<Record<CauseChoice, number>> | undefined;
  appliedCount: number;
  onClearAll: () => void;
  sectionsOpen: Record<VolunteerFilterSectionKey, boolean>;
  onToggleSection: (key: VolunteerFilterSectionKey) => void;
}

/** The volunteer board's filters: one radio group per question (how much
 *  time, which cause), each with "any" first. The same panel renders as the
 *  desktop sidebar and, with `isInSheet`, inside the mobile filters sheet. */
export function VolunteerFilterSidebar({
  isInSheet = false,
  commitment,
  onCommitmentChange,
  cause,
  onCauseChange,
  commitmentCounts,
  causeCounts,
  appliedCount,
  onClearAll,
  sectionsOpen,
  onToggleSection,
}: VolunteerFilterSidebarProps) {
  const { t } = useTranslation();
  // Defensive: the page mounts the sheet only below the mobile cutover, but
  // separate names keep the two panels' radio groups apart should both ever
  // render at once.
  const namePrefix = isInSheet ? "volunteer-sheet" : "volunteer";
  // Each section's title names its radio group.
  const commitmentHeadingId = useId();
  const causeHeadingId = useId();
  return (
    <FilterSidebarPanel
      isInSheet={isInSheet}
      appliedCount={appliedCount}
      onClearAll={onClearAll}
    >
      <FilterSection
        title={t("marketing:volunteer.filter.commitmentTitle")}
        headingId={commitmentHeadingId}
        open={sectionsOpen.commitment}
        onToggle={() => onToggleSection("commitment")}
        activeCount={commitment === ANY_OPTION ? 0 : 1}
      >
        <VolunteerRadioRows
          headingId={commitmentHeadingId}
          name={`${namePrefix}-commitment`}
          options={COMMITMENT_OPTIONS}
          checkedValue={commitment}
          counts={commitmentCounts}
          onChange={onCommitmentChange}
        />
      </FilterSection>
      <FilterSection
        title={t("marketing:volunteer.filter.causeTitle")}
        headingId={causeHeadingId}
        open={sectionsOpen.cause}
        onToggle={() => onToggleSection("cause")}
        activeCount={cause === ANY_OPTION ? 0 : 1}
      >
        <VolunteerRadioRows
          headingId={causeHeadingId}
          name={`${namePrefix}-cause`}
          options={CAUSE_OPTIONS}
          checkedValue={cause}
          counts={causeCounts}
          onChange={onCauseChange}
        />
      </FilterSection>
    </FilterSidebarPanel>
  );
}

/**
 * One section's radio group, each row with the count the facets give it.
 * A count is undefined while the first page is in flight, after it failed,
 * and on a server that predates the facets. That draws no number and never
 * disables the row: "not counted" and "nobody is here" are different
 * answers, and only the second one may take a choice away from a member.
 */
function VolunteerRadioRows<Value extends string>({
  headingId,
  name,
  options,
  checkedValue,
  counts,
  onChange,
}: {
  headingId: string;
  name: string;
  options: readonly VolunteerFilterOption<Value>[];
  checkedValue: Value;
  counts: Partial<Record<Value, number>> | undefined;
  onChange: (value: Value) => void;
}) {
  const { t } = useTranslation();
  return (
    <div role="radiogroup" aria-labelledby={headingId}>
      {options.map((option) => {
        const label = t(option.labelKey);
        const count = counts?.[option.value];
        const isChecked = checkedValue === option.value;
        return (
          <FilterOptionRow
            key={option.value}
            type="radio"
            name={name}
            value={option.value}
            label={label}
            isChecked={isChecked}
            // Nothing left under this option, so picking it could only empty
            // the board. Never while checked, or the member could not leave
            // it, and never for "Any", which only lifts a filter.
            isDisabled={
              count === 0 && !isChecked && option.value !== ANY_OPTION
            }
            count={count}
            ariaLabel={
              count === undefined
                ? label
                : t("marketing:volunteer.filter.withCount", { label, count })
            }
            onChange={() => onChange(option.value)}
          />
        );
      })}
    </div>
  );
}
