import { useId, type ReactNode } from "react";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  LEGAL_REQUEST_OUTCOMES,
  LEGAL_REQUEST_REGISTER_STATES,
  LEGAL_REQUEST_TYPES,
  type LegalRequestOutcome,
  type LegalRequestRegisterState,
  type LegalRequestType,
} from "./api/adminLegalRequests.api";
import type { AdminLegalRequestFilters } from "./api/useAdminLegalRequests";
import { AdminToolbar, adminToolbarClasses } from "./ui";
import styles from "./AdminLegalRequestsPage.module.css";

/** One toolbar select with its visible label beside it. The trigger is named
 *  by that label plus its own text, so the chosen value is read with it. */
function LabelledSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: ReactNode;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const labelId = useId();
  const triggerId = useId();
  return (
    <div className={styles.filterField}>
      <span id={labelId} className={styles.filterLabel}>
        {label}
      </span>
      <Select
        size="sm"
        id={triggerId}
        labelledBy={`${labelId} ${triggerId}`}
        className={adminToolbarClasses.select}
        value={value}
        options={options}
        onChange={(next) => {
          if (next) onChange(next);
        }}
      />
    </div>
  );
}

/**
 * The register's three filters on the admin toolbar, each select named by its
 * own visible label, and the count of matching records at the end.
 *
 * `state` defaults to `all`, matching the backend. A voided record is still
 * part of the register's history, and a queue that hid struck rows by default
 * would let a record be struck and then be hard to find again, which is the
 * failure the void-instead-of-delete rule exists to prevent.
 */
export function AdminLegalRequestFilterBar({
  filters,
  onChange,
  count,
}: {
  filters: AdminLegalRequestFilters;
  onChange: (patch: Partial<AdminLegalRequestFilters>) => void;
  /** The matching-records line, once the register has loaded. */
  count?: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <AdminToolbar
      label={t("admin:legalRequests.filter.toolbarLabel")}
      count={count}
    >
      <LabelledSelect
        label={t("admin:legalRequests.filter.stateLabel")}
        value={filters.state}
        options={LEGAL_REQUEST_REGISTER_STATES.map((state) => ({
          value: state,
          label: t(`admin:legalRequests.filter.state.${state}`),
        }))}
        onChange={(state) =>
          onChange({ state: state as LegalRequestRegisterState })
        }
      />
      <LabelledSelect
        label={t("admin:legalRequests.filter.typeLabel")}
        value={filters.requestType}
        options={[
          { value: "all", label: t("admin:legalRequests.filter.anyType") },
          ...LEGAL_REQUEST_TYPES.map((requestType) => ({
            value: requestType,
            label: t(`admin:legalRequests.type.${requestType}`),
          })),
        ]}
        onChange={(requestType) =>
          onChange({ requestType: requestType as LegalRequestType | "all" })
        }
      />
      <LabelledSelect
        label={t("admin:legalRequests.filter.outcomeLabel")}
        value={filters.outcome}
        options={[
          { value: "all", label: t("admin:legalRequests.filter.anyOutcome") },
          ...LEGAL_REQUEST_OUTCOMES.map((outcome) => ({
            value: outcome,
            label: t(`admin:legalRequests.outcome.${outcome}`),
          })),
        ]}
        onChange={(outcome) =>
          onChange({ outcome: outcome as LegalRequestOutcome | "all" })
        }
      />
    </AdminToolbar>
  );
}
