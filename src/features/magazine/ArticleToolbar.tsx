import {
  FiBookmark,
  FiCheck,
  FiMinus,
  FiPlus,
  FiShare2,
  FiType,
} from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useShareLink } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSaved } from "../../app/providers/useSaved";
import { routes } from "../../app/routeMap";
import styles from "./ArticleToolbar.module.css";

export type TextSize = "sm" | "md" | "lg";

const SIZES: TextSize[] = ["sm", "md", "lg"];

interface Props {
  textSize: TextSize;
  onTextSize: (size: TextSize) => void;
  /** Stable identity of the article being read — used to persist the save. */
  articleId?: string;
  /** Human title for the saved-items list (falls back to the document title). */
  articleTitle?: string;
  /** Small supporting line (author · read time). */
  articleMeta?: string;
  /** Short blurb shown on the saved card. */
  articleDescription?: string;
  /** Read-length pill for the saved card, e.g. "6 min read". */
  articleReadTime?: string;
}

/** Derive a stable slug + href from the current URL when props aren't passed. */
function deriveIdentity(articleId?: string) {
  if (articleId)
    return { slug: articleId, href: `${routes.article}?id=${articleId}` };
  if (typeof window === "undefined")
    return { slug: "current", href: routes.article };
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("id") ?? "current";
  return { slug, href: `${window.location.pathname}${window.location.search}` };
}

/**
 * PRD-113: whether this browser can open the platform's own share sheet.
 * Read at call time rather than at module load, so a test that stubs
 * `navigator.share` is honoured and a prerender (no `navigator`) says no.
 */
function canOpenShareSheet(): boolean {
  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
}

export function ArticleToolbar({
  textSize,
  onTextSize,
  articleId,
  articleTitle,
  articleMeta,
  articleDescription,
  articleReadTime,
}: Props) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isSaved, toggleSave: toggleSaved } = useSaved();
  // PRD-113: the clipboard half of sharing is the shared primitive every other
  // surface uses, so the toast copy and the reset behaviour stay identical.
  const { share: copyArticleLink } = useShareLink({
    copied: t("magazine:toolbar.linkCopiedToast"),
    failed: t("magazine:toolbar.linkCopyErrorToast"),
  });
  const hasShareSheet = canOpenShareSheet();

  const { slug, href } = deriveIdentity(articleId);
  const id = `article:${slug}`;
  const saved = isSaved(id);

  const sizeIndex = SIZES.indexOf(textSize);
  const decSize = () => sizeIndex > 0 && onTextSize(SIZES[sizeIndex - 1]!);
  const incSize = () =>
    sizeIndex < SIZES.length - 1 && onTextSize(SIZES[sizeIndex + 1]!);

  function toggleSave() {
    const title =
      articleTitle ??
      (typeof document !== "undefined"
        ? document.title
        : t("magazine:toolbar.fallbackTitle"));
    const next = toggleSaved({
      id,
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

  /**
   * PRD-113: the platform share sheet where the browser has one (every mobile
   * browser does), and the clipboard everywhere else. On a phone "Share" used
   * to mean a clipboard toast, which is the one place a reader expects to be
   * handed the OS list of apps to send a piece to.
   */
  async function share() {
    const url = window.location.href;
    if (canOpenShareSheet()) {
      try {
        await navigator.share({
          title:
            articleTitle ??
            (typeof document !== "undefined" ? document.title : undefined),
          text: articleDescription,
          url,
        });
        return;
      } catch (shareError) {
        // Dismissing the sheet raises AbortError. The reader chose not to
        // share, so quietly copying the link instead would be a surprise.
        if (
          shareError instanceof DOMException &&
          shareError.name === "AbortError"
        ) {
          return;
        }
        // Anything else (no permission, an unsupported payload) falls through
        // to the clipboard, which is still a way to share the piece.
      }
    }
    await copyArticleLink(url);
  }

  return (
    <div
      className={styles.toolbar}
      role="toolbar"
      aria-label={t("magazine:toolbar.ariaLabel")}
    >
      <div
        className={styles.group}
        role="group"
        aria-label={t("magazine:toolbar.textSizeGroupAriaLabel")}
      >
        <FiType className={styles.groupIcon} aria-hidden />
        <button
          type="button"
          className={styles.iconBtn}
          onClick={decSize}
          disabled={sizeIndex === 0}
          aria-label={t("magazine:toolbar.decreaseTextSizeAriaLabel")}
        >
          <FiMinus aria-hidden />
        </button>
        <span className={styles.sizeReadout} aria-live="polite">
          {textSize === "sm" ? "A−" : textSize === "lg" ? "A+" : "A"}
        </span>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={incSize}
          disabled={sizeIndex === SIZES.length - 1}
          aria-label={t("magazine:toolbar.increaseTextSizeAriaLabel")}
        >
          <FiPlus aria-hidden />
        </button>
      </div>

      <div className={styles.spacer} />

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
          {saved
            ? t("magazine:toolbar.savedCta")
            : t("magazine:toolbar.saveCta")}
        </span>
      </button>

      <button
        type="button"
        className={styles.action}
        onClick={() => void share()}
        aria-label={
          hasShareSheet
            ? t("magazine:toolbar.shareArticleAriaLabel")
            : t("magazine:toolbar.copyLinkAriaLabel")
        }
      >
        <FiShare2 aria-hidden />
        <span>{t("magazine:toolbar.shareCta")}</span>
      </button>

      {saved && (
        <span className={styles.savedHint} aria-hidden>
          <FiCheck /> {t("magazine:toolbar.savedHint")}
        </span>
      )}
    </div>
  );
}
