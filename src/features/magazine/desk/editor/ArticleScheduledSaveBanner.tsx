import { FiAlertCircle, FiAlertTriangle } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import tickStyles from "../pieceTabs.module.css";
import styles from "../../ArticleEditorPage.module.css";

export interface ArticleScheduledSaveBannerProps {
  /** Server-authored readiness reasons the refused save would have opened,
   *  rendered verbatim as the same list `PublishRail` renders for a refused
   *  publish. */
  openGateItems: string[];
}

/**
 * ENG-460. A scheduled article goes live on its own, on the strength of the
 * readiness check it passed when it was scheduled, so the server refuses a
 * save that would reopen that check (a cleared standfirst, an image with no
 * alt text). The header's "Couldn't save" alone would leave the writer
 * retrying a save that can only fail again, so this says what to put back
 * and points at the header's Unpublish, the other way out: the header hides
 * its "Retry save" while this banner shows, and an unpublish sends the held
 * change once the article is off the schedule (`useArticlePublishHandler`).
 *
 * Shares the conflict banner's warning family and its spot under the bar.
 * The next save that restores the missing piece clears it, since the save
 * error it reads from resets with every new write.
 */
export function ArticleScheduledSaveBanner({
  openGateItems,
}: ArticleScheduledSaveBannerProps) {
  const { t } = useTranslation();
  return (
    <aside className={styles.conflict} role="alert">
      <span className={styles.conflictIcon} aria-hidden>
        <FiAlertTriangle />
      </span>
      <div className={styles.conflictBody}>
        <b>{t("magazine:write.scheduledSave.heading")}</b>
        <p>{t("magazine:write.scheduledSave.body")}</p>
        {openGateItems.length > 0 && (
          <ul className={tickStyles.ticks}>
            {openGateItems.map((item) => (
              <li key={item} className={tickStyles.open}>
                <FiAlertCircle aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
