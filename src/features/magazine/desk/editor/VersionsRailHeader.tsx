import { FiPlus } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./VersionsRail.module.css";

export interface VersionsRailHeaderProps {
  /** How many versions are listed; the count pill hides while it is unknown
   *  (loading, error) or zero. */
  versionCount: number | null;
  isSaving: boolean;
  onSave: () => void;
}

/**
 * The History rail's heading row: the title with a quiet version count, and a
 * compact "Save a version" action on the right. The row wraps, so in a very
 * narrow rail the button drops onto its own line, still right-aligned.
 */
export function VersionsRailHeader({
  versionCount,
  isSaving,
  onSave,
}: VersionsRailHeaderProps) {
  const { t } = useTranslation();
  const hasCount = versionCount !== null && versionCount > 0;

  return (
    <div className={styles.head}>
      <h3 className={styles.title}>
        {t("magazine:write.versions.title")}
        {hasCount && (
          <>
            <span className={styles.count} aria-hidden="true">
              {versionCount}
            </span>
            <span className="visuallyHidden">
              {t("magazine:write.versions.count", { count: versionCount })}
            </span>
          </>
        )}
      </h3>
      <Button
        size="sm"
        variant="ghost"
        className={styles.saveButton}
        onClick={onSave}
        disabled={isSaving}
        aria-busy={isSaving || undefined}
      >
        <FiPlus aria-hidden />
        {isSaving
          ? t("magazine:write.versions.saving")
          : t("magazine:write.versions.saveCta")}
      </Button>
    </div>
  );
}
