import { FiCheck, FiShare2 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSaved } from "../../app/providers/useSaved";
import { routes } from "../../app/routeMap";
import { ShareMenu } from "../messages/share/ShareMenu";
import {
  articleSharePath,
  buildArticleShareMessage,
} from "./articleShareMessage";
import type { TextSize } from "./articleTextSize.data";
import { deriveIdentity, resolveArticleTitle } from "./articleToolbarIdentity";
import { ArticleTextSizeGroup } from "./ArticleTextSizeGroup";
import { ArticleSaveButton } from "./ArticleSaveButton";
import styles from "./ArticleToolbar.module.css";

export type { TextSize } from "./articleTextSize.data";

interface Props {
  textSize: TextSize;
  onTextSize: (size: TextSize) => void;
  /** Stable identity of the article being read, used to persist the save. */
  articleId?: string;
  /** Human title for the saved-items list (falls back to the document title). */
  articleTitle?: string;
  /** Small supporting line (author · read time). */
  articleMeta?: string;
  /** Short blurb shown on the saved card. */
  articleDescription?: string;
  /** Read-length pill for the saved card, e.g. "6 min read". */
  articleReadTime?: string;
  /** The line under the headline, which leads the shared message. */
  articleStandfirst?: string;
  /** Who wrote it, the shared message's last line above the link. */
  articleByline?: string;
  /** The language of the piece on screen, so a shared link keeps it. */
  articleLocale?: string;
}

export function ArticleToolbar({
  textSize,
  onTextSize,
  articleId,
  articleTitle,
  articleMeta,
  articleDescription,
  articleReadTime,
  articleStandfirst,
  articleByline,
  articleLocale,
}: Props) {
  const { t } = useTranslation();
  const { isSaved } = useSaved();

  const { slug, href } = deriveIdentity(articleId);
  const savedItemId = `article:${slug}`;
  const saved = isSaved(savedItemId);
  const resolvedTitle = resolveArticleTitle(articleTitle, t);
  // Without an id there is no piece to name, so the link is the reader's
  // front door, which opens the curated default in demo.
  const sharePath =
    slug === "current" ? routes.article : articleSharePath(slug, articleLocale);
  const shareMessage = buildArticleShareMessage(
    {
      title: resolvedTitle,
      standfirst: articleStandfirst,
      description: articleDescription,
      byline: articleByline,
    },
    t,
  );

  return (
    <div
      className={styles.toolbar}
      role="toolbar"
      aria-label={t("magazine:toolbar.ariaLabel")}
    >
      <ArticleTextSizeGroup textSize={textSize} onTextSize={onTextSize} />

      <div className={styles.spacer} />

      <ArticleSaveButton
        savedItemId={savedItemId}
        href={href}
        articleTitle={articleTitle}
        articleMeta={articleMeta}
        articleDescription={articleDescription}
        articleReadTime={articleReadTime}
      />

      {/* PRD-113: every way to pass the piece on behind the one labelled
          Share button: a message, WhatsApp, the device's share sheet, the
          composed message and the bare link. */}
      <ShareMenu
        content={{
          path: sharePath,
          title: resolvedTitle,
          kind: "article",
          text: shareMessage,
        }}
        renderTrigger={({ triggerProps }) => (
          <button
            type="button"
            className={styles.action}
            aria-label={t("magazine:toolbar.shareArticleAriaLabel")}
            {...triggerProps}
          >
            <FiShare2 aria-hidden />
            <span>{t("magazine:toolbar.shareCta")}</span>
          </button>
        )}
      />

      {saved && (
        <span className={styles.savedHint} aria-hidden>
          <FiCheck /> {t("magazine:toolbar.savedHint")}
        </span>
      )}
    </div>
  );
}
