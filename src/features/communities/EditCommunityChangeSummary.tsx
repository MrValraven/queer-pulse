import { FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import {
  hasSharedValueChange,
  type CommunityFieldChange,
} from "./editCommunityChanges";
import { GOVERNANCE_FIELD_LABEL_KEYS } from "./communityGovernanceLog.data";
import { isSharedValueKey } from "./startCommunity/sharedValueLibrary.data";
import styles from "./EditCommunityModal.module.css";

/**
 * The owner-facing name for a field the save will write. Reuses the labels the
 * governance log already has for the same fields, so the summary and the trail
 * that records it can never call one field two names. `rules` is the exception:
 * the trail calls them rules (the column's name, and what the join flow calls
 * them), while every surface an owner edits calls them shared values.
 */
function fieldLabel(field: string, t: TFunction): string {
  if (field === "rules") return t("communities:values.picker.title");
  const labelKey = GOVERNANCE_FIELD_LABEL_KEYS[field];
  return labelKey ? t(labelKey) : t("communities:edit.changes.otherField");
}

/**
 * One shared value as the owner reads it. A community founded through the
 * wizard can hold library picks as their i18n keys rather than as sentences,
 * which the read surfaces already resolve on the way out
 * (`CommunityRulesList`, `AboutResourcesTab`). Doing the same here keeps the
 * summary from naming `communities:start.rulePreset.consent` as the thing
 * about to be removed.
 */
function valueText(value: string, t: TFunction): string {
  return isSharedValueKey(value) ? t(value) : value;
}

/** The added / removed / reordered lines under one list field. */
function ListChangeLines({ change }: { change: CommunityFieldChange }) {
  const { t } = useTranslation();
  const listDiff = change.listDiff;
  if (!listDiff) return null;

  const join = (values: string[]) =>
    values.map((value) => valueText(value, t)).join("; ");

  return (
    <>
      {listDiff.added.length > 0 && (
        <span className={styles.changeAdded}>
          {t("communities:edit.changes.added", {
            values: join(listDiff.added),
          })}
        </span>
      )}
      {listDiff.removed.length > 0 && (
        <span className={styles.changeRemoved}>
          {t("communities:edit.changes.removed", {
            values: join(listDiff.removed),
          })}
        </span>
      )}
      {listDiff.isReordered && (
        <span className={styles.changeDetail}>
          {t("communities:edit.changes.reordered")}
        </span>
      )}
    </>
  );
}

/**
 * What pressing Save will actually write, shown next to the button that writes
 * it. Renders nothing while the form is untouched, which is exactly when Save
 * is disabled: both read the same comparison of the outgoing DTO against the
 * one the form opened with, so the summary cannot claim a change the save
 * would not make, or stay silent about one it would.
 *
 * List fields name what entered and what left. Everything else is named but
 * not quoted: the live card preview beside the form is already showing the new
 * name, tagline, cover and kind as they are typed, and repeating the before
 * and after of a long purpose here would bury the shared values, which are the
 * one thing this form changes that reaches every member.
 */
export function EditCommunityChangeSummary({
  changes,
}: {
  changes: CommunityFieldChange[];
}) {
  const { t } = useTranslation();
  if (changes.length === 0) return null;

  return (
    <section className={styles.changes}>
      <h3 className={styles.changesTitle}>
        {t("communities:edit.changes.title")}
      </h3>
      <ul className={styles.changesList}>
        {changes.map((change) => (
          <li key={change.field} className={styles.changeRow}>
            <span className={styles.changeField}>
              {fieldLabel(change.field, t)}
            </span>
            <ListChangeLines change={change} />
          </li>
        ))}
      </ul>
      {hasSharedValueChange(changes) && (
        <p className={styles.changesNotice}>
          <FiAlertCircle size={14} aria-hidden />
          {t("communities:edit.changes.reconsent")}
        </p>
      )}
    </section>
  );
}
