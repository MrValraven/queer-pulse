import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ArticleTagList.module.css";

/** The magazine search page, filtered to one tag. */
function tagBrowsePath(tag: string): string {
  return `${routes.magazineSearch}?tag=${encodeURIComponent(tag)}`;
}

interface ArticleTagListProps {
  tags: string[];
  /** The tag the reader is currently browsing. It stays a link (following it
   *  again is harmless) but is highlighted and marked `aria-current="page"`. */
  activeTag?: string;
  className?: string;
}

/**
 * CON-12 — an article's tags, as links a reader can actually follow.
 *
 * Every published piece carries tags and the article list API has always been
 * able to filter by them, but they were never rendered anywhere: they existed
 * only to compute the related rail. So the one piece of editorial taxonomy
 * attached to every article was invisible, and there was no way to say "more
 * like this". Each tag now links to `${routes.magazineSearch}?tag=<tag>`.
 *
 * Deliberately its own file with no page-specific styling, so every surface
 * that shows an article's metadata (the reader, the section list, the search
 * results) renders the same pills.
 *
 * A tag is editorial vocabulary the desk chose, so it prints as authored and
 * is never translated. The list's accessible name is chrome, so that is.
 */
export function ArticleTagList({
  tags,
  activeTag,
  className,
}: ArticleTagListProps) {
  const { t } = useTranslation();
  if (tags.length === 0) return null;

  return (
    <ul
      aria-label={t("magazine:tags.listAriaLabel")}
      className={[styles.row, className].filter(Boolean).join(" ")}
    >
      {tags.map((tag) => {
        const isActive = tag === activeTag;
        return (
          <li key={tag} className={styles.item}>
            <Link
              to={tagBrowsePath(tag)}
              className={[styles.tag, isActive && styles.tagActive]
                .filter(Boolean)
                .join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              {tag}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
