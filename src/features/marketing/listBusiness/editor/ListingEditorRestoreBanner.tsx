import { FiAlertTriangle, FiRotateCcw } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat } from "../../../../shared/i18n/format";
import { relativeAgo } from "../../../../shared/lib/relativeAgo";
import type { RestorableEditDraft } from "./useListingEditorAutosave";
import styles from "./ListingEditor.module.css";

/**
 * The offer of a local copy the owner never got round to saving.
 *
 * It offers, it does not act. The form underneath is still exactly what the
 * server returned, so nothing published is touched until "Bring them back" is
 * pressed. When the server's own copy has moved on since this one was written
 * (an edit from another device, a moderator's correction), the banner says so
 * first, because restoring would then be replacing newer wording with older.
 */
export function ListingEditorRestoreBanner({
  restorable,
  onRestore,
  onDiscard,
}: {
  restorable: RestorableEditDraft;
  onRestore: () => void;
  onDiscard: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const when = relativeAgo(new Date(restorable.savedAt).toISOString(), t, fmt, {
    justNow: "marketing:listBusiness.editor.restore.justNow",
    unknown: "marketing:listBusiness.editor.restore.unknownWhen",
  });

  return (
    <section
      className={styles.restore}
      aria-labelledby="lb-editor-restore-title"
    >
      <span className={styles.restoreIcon}>
        <FiRotateCcw aria-hidden />
      </span>
      <div className={styles.restoreText}>
        <p id="lb-editor-restore-title" className={styles.restoreTitle}>
          {t("marketing:listBusiness.editor.restore.title", { when })}
        </p>
        <p className={styles.restoreSub}>
          {t("marketing:listBusiness.editor.restore.sub")}
        </p>
        {restorable.hasServerChanged && (
          <p className={styles.restoreWarn}>
            <FiAlertTriangle aria-hidden />{" "}
            {t("marketing:listBusiness.editor.restore.serverChanged")}
          </p>
        )}
      </div>
      <div className={styles.restoreActions}>
        <Button variant="ghost" size="sm" onClick={onDiscard}>
          {t("marketing:listBusiness.editor.restore.discardCta")}
        </Button>
        <Button variant="primary" size="sm" onClick={onRestore}>
          {t("marketing:listBusiness.editor.restore.restoreCta")}
        </Button>
      </div>
    </section>
  );
}
