import { useId } from "react";
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
import styles from "./AdminLegalRequestsPage.module.css";

/**
 * The register's three filters, each a labelled `<select>` so the control is
 * named by its own visible label rather than by a placeholder.
 *
 * `state` defaults to `all`, matching the backend. A voided record is still
 * part of the register's history, and a queue that hid struck rows by default
 * would let a record be struck and then be hard to find again, which is the
 * failure the void-instead-of-delete rule exists to prevent.
 */
export function AdminLegalRequestFilterBar({
  filters,
  onChange,
}: {
  filters: AdminLegalRequestFilters;
  onChange: (patch: Partial<AdminLegalRequestFilters>) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();

  return (
    <div className={styles.filters}>
      <div className={styles.filterField}>
        <label className={styles.filterLabel} htmlFor={`${fieldId}-state`}>
          {t("admin:legalRequests.filter.stateLabel")}
        </label>
        <select
          id={`${fieldId}-state`}
          className={styles.select}
          value={filters.state}
          onChange={(event) =>
            onChange({
              state: event.target.value as LegalRequestRegisterState,
            })
          }
        >
          {LEGAL_REQUEST_REGISTER_STATES.map((state) => (
            <option key={state} value={state}>
              {t(`admin:legalRequests.filter.state.${state}`)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterField}>
        <label className={styles.filterLabel} htmlFor={`${fieldId}-type`}>
          {t("admin:legalRequests.filter.typeLabel")}
        </label>
        <select
          id={`${fieldId}-type`}
          className={styles.select}
          value={filters.requestType}
          onChange={(event) =>
            onChange({
              requestType: event.target.value as LegalRequestType | "all",
            })
          }
        >
          <option value="all">{t("admin:legalRequests.filter.anyType")}</option>
          {LEGAL_REQUEST_TYPES.map((requestType) => (
            <option key={requestType} value={requestType}>
              {t(`admin:legalRequests.type.${requestType}`)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterField}>
        <label className={styles.filterLabel} htmlFor={`${fieldId}-outcome`}>
          {t("admin:legalRequests.filter.outcomeLabel")}
        </label>
        <select
          id={`${fieldId}-outcome`}
          className={styles.select}
          value={filters.outcome}
          onChange={(event) =>
            onChange({
              outcome: event.target.value as LegalRequestOutcome | "all",
            })
          }
        >
          <option value="all">
            {t("admin:legalRequests.filter.anyOutcome")}
          </option>
          {LEGAL_REQUEST_OUTCOMES.map((outcome) => (
            <option key={outcome} value={outcome}>
              {t(`admin:legalRequests.outcome.${outcome}`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
