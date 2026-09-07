import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal } from "./ui";
import type { PolicyDiffGroup } from "./adminGovernancePolicyDiff";
import styles from "./AdminGovernancePolicy.module.css";

/**
 * "Before you save": every difference between the draft and the page members
 * can read right now, grouped by section, plus the optional reason that goes
 * into the audit log with the change.
 *
 * The reason lives here rather than in each section footer because there is now
 * one save: five separate reason boxes would have asked an editor to explain the
 * same edit up to five times, or (more likely) to explain it nowhere.
 */
export function AdminGovernancePolicyReviewSheet({
  groups,
  isSaving,
  onClose,
  onSave,
}: {
  groups: PolicyDiffGroup[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
}) {
  const { t } = useTranslation();
  const [note, setNote] = useState("");

  return (
    <AdminModal
      wide
      eyebrow={t("admin:governance.policy.review.eyebrow")}
      title={t("admin:governance.policy.review.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:governance.policy.review.keepEditing")}
          </Button>
          <Button
            variant="primary"
            onClick={() => onSave(note.trim())}
            disabled={isSaving || groups.length === 0}
          >
            {t("admin:governance.policy.bar.save")}
          </Button>
        </>
      }
    >
      <p className={styles.reviewSub}>
        {t("admin:governance.policy.review.sub")}
      </p>

      {groups.map((group) => (
        <div key={group.sectionId} className={styles.diffGroup}>
          <h4 className={styles.diffGroupHead}>{group.title}</h4>
          {group.entries.map((entry) => (
            <div key={entry.label} className={styles.diffRow}>
              <span className={styles.diffKey}>{entry.label}</span>
              <span className={styles.diffValue}>
                {entry.before === null && (
                  <span className={styles.diffAfter}>
                    {t("admin:governance.policy.diff.added", {
                      value: entry.after ?? "",
                    })}
                  </span>
                )}
                {entry.after === null && (
                  <span className={styles.diffBefore}>
                    {t("admin:governance.policy.diff.removed", {
                      value: entry.before ?? "",
                    })}
                  </span>
                )}
                {entry.before !== null && entry.after !== null && (
                  <>
                    <s className={styles.diffBefore}>{entry.before}</s>
                    <span className={styles.diffArrow} aria-hidden>
                      &rarr;
                    </span>
                    <span className={styles.diffAfter}>{entry.after}</span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      ))}

      <div className={styles.noteField}>
        <label className={styles.noteLabel} htmlFor="policy-save-note">
          {t("admin:governance.policy.review.note")}
        </label>
        <input
          id="policy-save-note"
          type="text"
          value={note}
          maxLength={200}
          placeholder={t("admin:governance.policy.review.notePlaceholder")}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
    </AdminModal>
  );
}
