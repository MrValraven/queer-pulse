import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "../../ArticleEditorPage.module.css";

export interface ArticleDraftConflictBannerProps {
  /** Re-reads the draft and reseeds the editor from it. Discards whatever
   *  this tab had unsaved, which the copy says outright. */
  onReload: () => void;
  isReloading: boolean;
}

/**
 * ENG-111. The blocking state for an article draft that moved on underneath
 * this tab.
 *
 * It appears when a save comes back 409, which means another editor saved, or
 * the piece's writer filed a draft, or a version was restored elsewhere,
 * since this editor last read the article. Autosave has already stopped by
 * the time this renders: retrying would send the same stale version, and
 * forcing the write through would replace the other person's whole `blocks`
 * array with no snapshot to recover it from.
 *
 * The writer's text stays on screen on purpose. A full-page takeover would be
 * more emphatic and would also hide the paragraph they are mid-way through,
 * with no way to copy it out before the reload throws it away.
 *
 * The voice matches the server's own 409 (`assertArticleVersionCurrent`) and
 * the writer-side file-draft conflict, so a writer and an editor hitting the
 * same wall are told the same thing.
 */
export function ArticleDraftConflictBanner({
  onReload,
  isReloading,
}: ArticleDraftConflictBannerProps) {
  const { t } = useTranslation();
  return (
    <aside className={styles.conflict} role="alert">
      <span className={styles.conflictIcon} aria-hidden>
        <FiAlertTriangle />
      </span>
      <div className={styles.conflictBody}>
        <b>{t("magazine:write.conflict.heading")}</b>
        <p>{t("magazine:write.conflict.body")}</p>
      </div>
      <Button
        variant="plum"
        size="sm"
        onClick={onReload}
        disabled={isReloading}
        aria-busy={isReloading}
      >
        <FiRefreshCw aria-hidden />
        {t("magazine:write.conflict.reloadCta")}
      </Button>
    </aside>
  );
}
