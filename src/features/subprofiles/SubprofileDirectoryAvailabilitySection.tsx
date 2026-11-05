import { useId } from "react";
import {
  FilterOptionRow,
  FilterSection,
} from "../../shared/components/filterPage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DIRECTORY_AVAILABILITY_ANY_LABEL_KEY,
  DIRECTORY_AVAILABILITY_OPTIONS,
} from "./subprofileDirectoryAvailability.data";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";

interface SubprofileDirectoryAvailabilitySectionProps {
  directory: SubprofileDirectoryFilters;
  /** False while the fetch is in flight or failed: every count is then left
   *  off and every option stays pickable. */
  isCountKnown: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * The sidebar's Availability section: one radio group with three rows, Any
 * availability, Open to collabs and Taking bookings. Picking a row replaces
 * the previous choice, and "Any availability" clears it.
 *
 * Each count is the server's availability facet, taken under every other
 * filter. A known 0 dims its row, unless that row is the checked one (a
 * member must always be able to leave it). An unknown count draws no number
 * and leaves the row pickable.
 */
export function SubprofileDirectoryAvailabilitySection({
  directory,
  isCountKnown,
  isOpen,
  onToggle,
}: SubprofileDirectoryAvailabilitySectionProps) {
  const { t } = useTranslation();
  const groupName = useId();
  const {
    availability,
    setAvailability,
    availabilityCounts,
    isShowingPreviousResults,
  } = directory;

  return (
    <FilterSection
      title={t("subprofiles:directory.refine.availabilityLabel")}
      open={isOpen}
      onToggle={onToggle}
      activeCount={availability === null ? 0 : 1}
    >
      <FilterOptionRow
        type="radio"
        name={groupName}
        value="any"
        label={t(DIRECTORY_AVAILABILITY_ANY_LABEL_KEY)}
        isChecked={availability === null}
        onChange={() => setAvailability(null)}
      />
      {DIRECTORY_AVAILABILITY_OPTIONS.map((option) => {
        const label = t(option.labelKey);
        const count = isCountKnown
          ? availabilityCounts?.[option.value]
          : undefined;
        const isChecked = availability === option.value;
        return (
          <FilterOptionRow
            key={option.value}
            type="radio"
            name={groupName}
            value={option.value}
            label={label}
            isChecked={isChecked}
            // A known 0 could only empty the grid. Never disabled while
            // checked, or a member could not switch it back off.
            isDisabled={count === 0 && !isChecked}
            count={count}
            isCountStale={isShowingPreviousResults}
            // The badge is aria-hidden, so the control carries the phrase.
            ariaLabel={
              count === undefined
                ? label
                : t("subprofiles:directory.refine.optionWithCount", {
                    label,
                    count,
                  })
            }
            onChange={() => setAvailability(option.value)}
          />
        );
      })}
    </FilterSection>
  );
}
