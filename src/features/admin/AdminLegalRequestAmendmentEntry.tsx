import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { formatDate } from "../../shared/lib/date";
import {
  LEGAL_REQUEST_AMENDABLE_FIELDS,
  type LegalRequestAmendableField,
  type LegalRequestAmendmentDTO,
  type LegalRequestFieldValue,
} from "./api/adminLegalRequests.api";
import styles from "./AdminLegalRequestsPage.module.css";

/** The catalogue label for each amendable field, reusing the editor's own
 *  field names so the history and the form describe a field the same way. */
const FIELD_LABEL_KEYS: Record<LegalRequestAmendableField, string> = {
  requestingBody: "admin:legalRequests.field.requestingBody",
  jurisdiction: "admin:legalRequests.field.jurisdiction",
  requestType: "admin:legalRequests.field.requestType",
  receivedOn: "admin:legalRequests.field.receivedOn",
  accountsAffected: "admin:legalRequests.field.accountsAffected",
  outcome: "admin:legalRequests.field.outcome",
  dataDisclosed: "admin:legalRequests.field.dataDisclosed",
  memberNotifiedOn: "admin:legalRequests.field.memberNotifiedOn",
  accountsNotified: "admin:legalRequests.field.accountsNotified",
  notificationWithheldReason: "admin:legalRequests.field.withheldReason",
  isUnderGagOrder: "admin:legalRequests.field.gagOrder",
  internalNote: "admin:legalRequests.field.internalNote",
};

/**
 * One stored value in words. The backend serves identifiers and raw dates, so
 * each field is read through the same vocabulary the detail facts use. A value
 * whose shape does not match its field is shown as it was stored, so an
 * unexpected row stays readable.
 */
function formatFieldValue(
  field: LegalRequestAmendableField,
  value: LegalRequestFieldValue,
  t: TFunction,
  language: string,
): string {
  if (value === null) return t("admin:legalRequests.history.emptyValue");
  if (field === "dataDisclosed" && Array.isArray(value)) {
    if (value.length === 0) {
      return t("admin:legalRequests.history.nothingDisclosed");
    }
    return value
      .map((category) => t(`admin:legalRequests.dataCategory.${category}`))
      .join(", ");
  }
  if (field === "isUnderGagOrder" && typeof value === "boolean") {
    return value
      ? t("admin:legalRequests.history.yes")
      : t("admin:legalRequests.history.no");
  }
  if (typeof value !== "string") {
    return Array.isArray(value) ? value.join(", ") : String(value);
  }
  if (field === "requestType") return t(`admin:legalRequests.type.${value}`);
  if (field === "outcome") return t(`admin:legalRequests.outcome.${value}`);
  if (field === "receivedOn" || field === "memberNotifiedOn") {
    return formatDate(value, language, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return value;
}

/** Free text ends in its own full stop, and the spoken sentence adds one after
 *  each value; trimming it here keeps a screen reader from pausing mid-line. */
function withoutFinalStop(text: string): string {
  return text.replace(/\.$/, "");
}

/**
 * One amendment: who made it, when, and every field that moved, in the order
 * the backend's diff walks them.
 *
 * The arrow is decoration. Each change also carries a visually hidden sentence,
 * so a screen reader hears "changed from X to Y" in words.
 */
export function AdminLegalRequestAmendmentEntry({
  amendment,
}: {
  amendment: LegalRequestAmendmentDTO;
}) {
  const { t, language } = useTranslation();
  const changedFields = LEGAL_REQUEST_AMENDABLE_FIELDS.filter(
    (field) => amendment.changes[field] !== undefined,
  );

  return (
    <li className={styles.historyEntry}>
      <p className={styles.historyMeta}>
        <span
          className={
            amendment.actorName
              ? styles.historyActor
              : `${styles.historyActor} ${styles.historyActorErased}`
          }
        >
          {amendment.actorName ?? t("admin:legalRequests.history.actorErased")}
        </span>
        <time className={styles.historyTime} dateTime={amendment.createdAt}>
          {formatDate(amendment.createdAt, language, {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </time>
      </p>
      <dl className={styles.historyChanges}>
        {changedFields.map((field) => {
          const change = amendment.changes[field];
          if (!change) return null;
          const fromText = formatFieldValue(field, change.from, t, language);
          const toText = formatFieldValue(field, change.to, t, language);
          return (
            <div key={field}>
              <dt className={styles.detailTerm}>
                {t(FIELD_LABEL_KEYS[field])}
              </dt>
              <dd className={styles.historyChange}>
                <span className="visuallyHidden">
                  {t("admin:legalRequests.history.changeSpoken", {
                    from: withoutFinalStop(fromText),
                    to: withoutFinalStop(toText),
                  })}
                </span>
                <span className={styles.historyValues} aria-hidden="true">
                  <span className={styles.historyFrom}>{fromText}</span>
                  <span className={styles.historyTo}>
                    <FiArrowRight aria-hidden className={styles.historyArrow} />
                    {toText}
                  </span>
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
    </li>
  );
}
