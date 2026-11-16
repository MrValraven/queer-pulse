import { useId } from "react";
import { Select } from "../../../shared/components/ui";
import { useMediaQuery } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminSeg, adminToolbarClasses } from "../ui";
import { isLeadAssignedToFilter } from "./api/leads.types";
import {
  LEAD_ASSIGNEE_EVERYONE,
  LEAD_ASSIGNEE_FILTER_OPTIONS,
  LEAD_ASSIGNEE_PHONE_QUERY,
} from "./leadAssignees.data";
import type { LeadListControls } from "./useLeadListFilters";
import styles from "./LeadAssigneeFilter.module.css";

/**
 * The In charge view of the lead list: Everyone, Assigned to me, Mine and
 * unassigned, Unassigned. A segmented control on a desktop, a compact select
 * on a phone. Choosing Everyone clears the `assignedTo` param.
 */
export function LeadAssigneeFilter({
  controls,
}: {
  controls: LeadListControls;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const isPhone = useMediaQuery(LEAD_ASSIGNEE_PHONE_QUERY);
  const options = LEAD_ASSIGNEE_FILTER_OPTIONS.map(({ value, labelKey }) => ({
    value,
    label: t(labelKey),
  }));
  const value = controls.filters.assignedTo ?? LEAD_ASSIGNEE_EVERYONE;
  const choose = (chosen: string | null) =>
    controls.setAssignedTo(isLeadAssignedToFilter(chosen) ? chosen : null);

  return (
    <div className={styles.filter}>
      <span id={labelId} className={styles.label}>
        {t("admin:leads.list.assigneeFilterLabel")}
      </span>
      {isPhone ? (
        <Select
          size="sm"
          className={adminToolbarClasses.select}
          labelledBy={labelId}
          options={options}
          value={value}
          onChange={choose}
        />
      ) : (
        <AdminSeg
          className={styles.seg}
          ariaLabelledby={labelId}
          options={options}
          value={value}
          onChange={choose}
        />
      )}
    </div>
  );
}
