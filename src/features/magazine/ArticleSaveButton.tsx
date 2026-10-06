import { FiBookmark } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSaved } from "../../app/providers/useSaved";
import { resolveArticleTitle } from "./articleToolbarIdentity";
import styles from "./ArticleToolbar.module.css";

interface Props {
  /** The saved-items key, `article:<slug>`. */
  savedItemId: string;
  /** Where the saved card links back to. */
  href: string;
  articleTitle?: string;
  articleMeta?: string;
  articleDescription?: string;
  articleReadTime?: string;
}

/** The toolbar's reading-list toggle, with its toast. */
export function ArticleSaveButton({
  savedItemId,
  href,
  articleTitle,
  articleMeta,
  articleDescription,
  articleReadTime,
}: Props) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isSaved, toggleSave: toggleSaved } = useSaved();
  const saved = isSaved(savedItemId);

  function toggleSave() {
    const title = resolveArticleTitle(articleTitle, t);
    const next = toggleSaved({
      id: savedItemId,
      kind: "article",
      title,
      href,
      meta: articleMeta,
      description: articleDescription,
      readTime: articleReadTime,
    });
    showToast(
      next
        ? t("magazine:toolbar.savedToast")
        : t("magazine:toolbar.removedToast"),
      next ? "success" : "info",
    );
  }

  return (
    <button
      type="button"
      className={[styles.action, saved && styles.actionOn]
        .filter(Boolean)
        .join(" ")}
      onClick={toggleSave}
      aria-pressed={saved}
      aria-label={
        saved
          ? t("magazine:toolbar.removeFromReadingListAriaLabel")
          : t("magazine:toolbar.saveToReadingListAriaLabel")
      }
    >
      <FiBookmark
        aria-hidden
        style={{ fill: saved ? "currentColor" : "none" }}
      />
      <span>
        {saved ? t("magazine:toolbar.savedCta") : t("magazine:toolbar.saveCta")}
      </span>
    </button>
  );
}
