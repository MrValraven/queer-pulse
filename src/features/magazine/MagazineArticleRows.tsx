import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ArticleTagList } from "./ArticleTagList";
import { firstPlainText, type Article } from "./data/articles";
import styles from "./MagazineArticleRows.module.css";

/** Rows to show while a list is loading and nothing is on screen yet. */
const ROW_SKELETON_COUNT = 4;

function ArticleRowSkeleton() {
  return (
    <div className={styles.row} aria-hidden>
      <SkeletonLine width="70%" height={20} />
      <SkeletonLine width="90%" height={14} style={{ marginTop: 10 }} />
      <SkeletonLine width="40%" height={12} style={{ marginTop: 8 }} />
    </div>
  );
}

/**
 * One article as a browse-list row: headline, blurb, byline meta, and (CON-12)
 * its tags as links into `?tag=`.
 *
 * The card is an `<article>` with the headline block as the only link inside
 * it, because the tag pills are links too and an anchor may not nest in an
 * anchor. The whole-card hover lift stays, so it still reads as one target.
 */
export function MagazineArticleRow({
  article,
  activeTag,
}: {
  article: Article;
  activeTag?: string;
}) {
  const dek = firstPlainText(article.body);
  return (
    <article className={styles.row}>
      <Link
        to={`${routes.article}?id=${article.id}`}
        className={styles.rowLink}
      >
        <h2 className={styles.rowTitle}>{article.title}</h2>
        {dek && <p className={styles.rowDek}>{dek}</p>}
        <p className={styles.rowMeta}>
          {article.byline} · {article.date} · {article.readTime}
        </p>
      </Link>
      <ArticleTagList
        tags={article.tags}
        activeTag={activeTag}
        className={styles.rowTags}
      />
    </article>
  );
}

/**
 * A list of `MagazineArticleRow`s, with its own loading skeletons. Callers own
 * the empty/error states, because what "nothing here" means differs per
 * surface (an empty section reads differently from a search that found
 * nothing).
 *
 * PRD-103: the "load more" footer lives here rather than in each page, so the
 * search results, the tag browse and the section drill-down all continue past
 * the backend's 20-row page the same way, and a reader who is told "43 pieces
 * found" can reach all 43. A caller that has nothing more to load simply omits
 * `onLoadMore` and the footer never renders.
 */
export function MagazineArticleRows({
  articles,
  isLoading,
  activeTag,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: {
  articles: Article[];
  isLoading: boolean;
  activeTag?: string;
  /** True while the server still holds pieces this list has not fetched. */
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}) {
  const { t } = useTranslation();
  const skeletonCount = articles.length || ROW_SKELETON_COUNT;
  return (
    <>
      <div className={styles.list}>
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <ArticleRowSkeleton key={index} />
            ))
          : articles.map((article) => (
              <MagazineArticleRow
                key={article.id}
                article={article}
                activeTag={activeTag}
              />
            ))}
      </div>

      {!isLoading && hasMore && onLoadMore && (
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            disabled={isLoadingMore}
            onClick={onLoadMore}
          >
            {isLoadingMore
              ? t("magazine:articleRows.loadingMore")
              : t("magazine:articleRows.loadMoreCta")}
          </Button>
        </div>
      )}
    </>
  );
}
