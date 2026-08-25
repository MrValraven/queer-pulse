import { FiEye } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { MissingField } from "../listBusiness.data";
import { MissingFieldsBar } from "../MissingFieldsBar";
import styles from "./ListingEditor.module.css";

/**
 * The editor's action bar: what is still needed, whether anything is unsaved,
 * a preview of the real page, and save.
 *
 * Sticks to the bottom of the viewport while the form scrolls, so saving is
 * reachable from any field instead of waiting at the end of a sequence.
 */
export function ListingEditorSaveBar({
  missing,
  isDirty,
  isSaving,
  onPreview,
  onSave,
}: {
  missing: MissingField[];
  isDirty: boolean;
  isSaving: boolean;
  onPreview: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  const isBlocked = missing.length > 0;

  return (
    <div className={styles.saveBar}>
      <MissingFieldsBar missing={missing} className={styles.saveBarMissing} />
      <div className={styles.saveBarRow}>
        <span className={styles.saveBarState} aria-live="polite">
          {t(
            isDirty
              ? "marketing:listBusiness.editor.unsavedChanges"
              : "marketing:listBusiness.editor.noChanges",
          )}
        </span>
        <div className={styles.saveBarActions}>
          <Button variant="ghost" onClick={onPreview}>
            <FiEye aria-hidden />{" "}
            {t("marketing:listBusiness.editor.previewCta")}
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={isBlocked || isSaving}
            title={
              isBlocked
                ? t("marketing:listBusiness.paneActions.blockedTitle")
                : undefined
            }
          >
            {t("marketing:listBusiness.edit.saveCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
