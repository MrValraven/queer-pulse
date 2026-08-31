import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminCheckLine } from "./ui";
import {
  LEGAL_REQUEST_DATA_CATEGORIES,
  LEGAL_REQUEST_OUTCOMES,
  LEGAL_REQUEST_TYPES,
  MAX_JURISDICTION_LENGTH,
  MAX_REQUESTING_BODY_LENGTH,
  type LegalRequestDataCategory,
  type LegalRequestOutcome,
  type LegalRequestType,
} from "./api/adminLegalRequests.api";
import type { LegalRequestFormDraft } from "./adminLegalRequestForm.utils";
import styles from "./AdminLegalRequestsPage.module.css";

/**
 * The demand itself: who asked, where, what kind of instrument, when it landed,
 * how many accounts it named, what happened, and which categories of data left
 * the platform.
 *
 * Every vocabulary is a closed key set from the backend, resolved to words by
 * the catalogue here. The backend serves no label text for any of them, which
 * is why a new enum value shows as a missing key rather than as raw
 * `snake_case` prose on a staff screen.
 */
export function AdminLegalRequestFields({
  draft,
  onChange,
}: {
  draft: LegalRequestFormDraft;
  onChange: (patch: Partial<LegalRequestFormDraft>) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();

  function toggleCategory(category: LegalRequestDataCategory) {
    const isOn = draft.dataDisclosed.includes(category);
    onChange({
      dataDisclosed: isOn
        ? draft.dataDisclosed.filter((current) => current !== category)
        : [...draft.dataDisclosed, category],
    });
  }

  return (
    <>
      <label className={styles.fieldLabel} htmlFor={`${fieldId}-body`}>
        {t("admin:legalRequests.field.requestingBody")}
      </label>
      <input
        id={`${fieldId}-body`}
        className={styles.textInput}
        value={draft.requestingBody}
        maxLength={MAX_REQUESTING_BODY_LENGTH}
        onChange={(event) => onChange({ requestingBody: event.target.value })}
        required
      />
      <p className={styles.fieldHint}>
        {t("admin:legalRequests.field.requestingBodyHint")}
      </p>

      <label className={styles.fieldLabel} htmlFor={`${fieldId}-jurisdiction`}>
        {t("admin:legalRequests.field.jurisdiction")}
      </label>
      <input
        id={`${fieldId}-jurisdiction`}
        className={styles.textInput}
        value={draft.jurisdiction}
        maxLength={MAX_JURISDICTION_LENGTH}
        onChange={(event) => onChange({ jurisdiction: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor={`${fieldId}-type`}>
        {t("admin:legalRequests.field.requestType")}
      </label>
      <select
        id={`${fieldId}-type`}
        className={styles.select}
        value={draft.requestType}
        onChange={(event) =>
          onChange({ requestType: event.target.value as LegalRequestType })
        }
      >
        {LEGAL_REQUEST_TYPES.map((requestType) => (
          <option key={requestType} value={requestType}>
            {t(`admin:legalRequests.type.${requestType}`)}
          </option>
        ))}
      </select>

      <label className={styles.fieldLabel} htmlFor={`${fieldId}-received`}>
        {t("admin:legalRequests.field.receivedOn")}
      </label>
      <input
        id={`${fieldId}-received`}
        type="date"
        className={styles.textInput}
        value={draft.receivedOn}
        onChange={(event) => onChange({ receivedOn: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor={`${fieldId}-affected`}>
        {t("admin:legalRequests.field.accountsAffected")}
      </label>
      <input
        id={`${fieldId}-affected`}
        type="number"
        inputMode="numeric"
        min={0}
        className={styles.textInput}
        value={draft.accountsAffected}
        onChange={(event) => onChange({ accountsAffected: event.target.value })}
      />
      <p className={styles.fieldHint}>
        {t("admin:legalRequests.field.accountsAffectedHint")}
      </p>

      <label className={styles.fieldLabel} htmlFor={`${fieldId}-outcome`}>
        {t("admin:legalRequests.field.outcome")}
      </label>
      <select
        id={`${fieldId}-outcome`}
        className={styles.select}
        value={draft.outcome}
        onChange={(event) =>
          onChange({ outcome: event.target.value as LegalRequestOutcome })
        }
      >
        {LEGAL_REQUEST_OUTCOMES.map((outcome) => (
          <option key={outcome} value={outcome}>
            {t(`admin:legalRequests.outcome.${outcome}`)}
          </option>
        ))}
      </select>
      <p className={styles.fieldHint}>
        {t("admin:legalRequests.field.outcomeHint")}
      </p>

      <span className={styles.fieldLabel}>
        {t("admin:legalRequests.field.dataDisclosed")}
      </span>
      <div className={styles.categoryPicker}>
        {LEGAL_REQUEST_DATA_CATEGORIES.map((category) => (
          <AdminCheckLine
            key={category}
            checked={draft.dataDisclosed.includes(category)}
            onChange={() => toggleCategory(category)}
            title={t(`admin:legalRequests.dataCategory.${category}`)}
          />
        ))}
      </div>
      <p className={styles.fieldHint}>
        {t("admin:legalRequests.field.dataDisclosedHint")}
      </p>
    </>
  );
}
