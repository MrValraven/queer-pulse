import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminGovernancePolicy.module.css";

/**
 * The one place the Policy tab is saved from.
 *
 * It sticks to the bottom of the editor column and says the same thing the
 * review sheet does, in one line: how many differences stand between this draft
 * and the page members can read, and across how many sections. It stays
 * mounted while clean (in its quiet variant) rather than appearing on the first
 * keystroke, so nothing under it shifts when a draft goes dirty.
 */
export function AdminGovernancePolicySaveBar({
  changeCount,
  changedSectionCount,
  blockedReason,
  isSaving,
  onReview,
  onDiscard,
  onSave,
}: {
  changeCount: number;
  changedSectionCount: number;
  /** Why the save cannot go, e.g. a half-translated row. Empty when it can. */
  blockedReason: string | null;
  isSaving: boolean;
  onReview: () => void;
  onDiscard: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  const isDirty = changeCount > 0;

  return (
    <div
      className={[styles.bar, !isDirty && styles.barIdle]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.barText}>
        <span className={styles.barCount}>
          {isDirty
            ? t("admin:governance.policy.bar.changes", { count: changeCount })
            : t("admin:governance.policy.bar.clean")}
        </span>
        <span className={styles.barDetail}>
          {isDirty
            ? t("admin:governance.policy.bar.changesDetail", {
                count: changedSectionCount,
              })
            : t("admin:governance.policy.bar.cleanDetail")}
        </span>
      </div>
      <span className={styles.barSpacer} />
      <div className={styles.barActions}>
        {/* The bar turns plum the moment the draft goes dirty, so its two
            secondary buttons switch to the dark-ground variant with it. */}
        <Button
          variant={isDirty ? "ghost-dark" : "ghost"}
          size="sm"
          onClick={onReview}
          disabled={!isDirty}
        >
          {t("admin:governance.policy.bar.review")}
        </Button>
        <Button
          variant={isDirty ? "ghost-dark" : "ghost"}
          size="sm"
          onClick={onDiscard}
          disabled={!isDirty || isSaving}
        >
          {t("admin:governance.policy.bar.discard")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          disabled={!isDirty || isSaving || blockedReason !== null}
        >
          {t("admin:governance.policy.bar.save")}
        </Button>
      </div>
      {blockedReason && <p className={styles.barBlocked}>{blockedReason}</p>}
    </div>
  );
}
