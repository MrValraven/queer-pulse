import { FiBriefcase } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JobFieldFilterValue } from "./JobFieldFilter";

interface JobsEmptyStateProps {
  /** True while the safety preference hides unverified employers. */
  isVerifiedOnly: boolean;
  fieldFilter: JobFieldFilterValue;
  onShowUnverified: () => void;
  onFieldFilterChange: (next: JobFieldFilterValue) => void;
}

/**
 * The board's empty state. The main action shows every role; the second one
 * appears only when it does something different: widening a single field back
 * to its whole group, or clearing the group while the safety filter is on.
 */
export function JobsEmptyState({
  isVerifiedOnly,
  fieldFilter,
  onShowUnverified,
  onFieldFilterChange,
}: JobsEmptyStateProps) {
  const { t } = useTranslation();
  const clearFieldFilter = () =>
    onFieldFilterChange({ groupId: null, fieldId: null });

  function secondaryAction() {
    if (fieldFilter.fieldId) {
      return {
        label: t("economy:jobs.fieldFilter.anyField"),
        onClick: () =>
          onFieldFilterChange({ groupId: fieldFilter.groupId, fieldId: null }),
      };
    }
    if (isVerifiedOnly && fieldFilter.groupId) {
      return {
        label: t("economy:jobs.empty.clearCategory"),
        onClick: clearFieldFilter,
      };
    }
    return undefined;
  }

  return (
    <EmptyState
      icon={<FiBriefcase />}
      title={t("economy:jobs.empty.title")}
      description={t(
        isVerifiedOnly
          ? "economy:jobs.empty.verifiedDescription"
          : "economy:jobs.empty.description",
      )}
      action={{
        label: t("economy:jobs.empty.showAll"),
        onClick: isVerifiedOnly ? onShowUnverified : clearFieldFilter,
      }}
      secondaryAction={secondaryAction()}
    />
  );
}
