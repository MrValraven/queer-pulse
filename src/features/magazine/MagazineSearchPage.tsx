import { Link, useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ApiError } from "../../shared/api/client";
import { MagazineMasthead } from "./MagazineMasthead";
import { MagazineSignInWall } from "./MagazineSignInWall";
import { ArticleTagList } from "./ArticleTagList";
import { MagazineArticleRows } from "./MagazineArticleRows";
import { MagazineSearchField } from "./MagazineSearchField";
import { useMagazineSearch } from "./api/useMagazineSearch";
import styles from "./MagazineSearchPage.module.css";

/**
 * CON-12 — the magazine's own search and tag browse.
 *
 * Until this page existed, live discovery in the magazine was the front
 * page's newest nine pieces, a section grid and an author directory: nothing
 * older than the first screen could be found, and the global search box only
 * ever matched headlines. This searches the whole published archive over the
 * `search_vector` index (title, dek, standfirst, tags, and the body in both
 * of the shapes it is stored in), ranked by relevance.
 *
 * THE URL IS THE STATE. `?q=`, `?tag=` and `?author=` drive the results and
 * seed the field, so a search is shareable, the back button works, and a tag
 * pill anywhere in the magazine can link straight into this page. All three
 * combine: a tag or a writer can be narrowed with a term.
 *
 * PRD-112: `?author=<slug>` is a writer's full back catalogue, which is where
 * the author page's "All {count} articles" now points. The author page itself
 * can only hold one 20-row page of a writer's work; this list pages through
 * all of it.
 *
 * PRD-103: results continue past the backend's 20-row page through the
 * shared "load more" footer, so the `total` this page prints is a number the
 * reader can actually reach.
 *
 * Five states, kept distinct because they mean different things:
 *   - nothing asked for   a prompt; no request is made
 *   - loading             skeleton rows
 *   - a 401               the members-only wall, with a way through
 *   - the request failed  says so, and offers a retry
 *   - it worked, no hits  says so
 * Collapsing the last two into one "nothing found" would tell a reader the
 * archive holds nothing on their subject when the truth is that the request
 * never arrived.
 */
export function MagazineSearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const term = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const author = searchParams.get("author") ?? "";
  const {
    articles,
    total,
    isLoading,
    isError,
    error,
    refetch,
    hasCriteria,
    hasMore,
    loadMore,
    isLoadingMore,
  } = useMagazineSearch({ q: term, tag, author });
  // Every hit under `?author=` carries the same byline, so the first row names
  // the writer without a second request. The slug is the honest fallback while
  // the first page is still in flight.
  const authorName = articles[0]?.byline ?? author;
  // Every magazine read sits behind `ActiveMemberGuard`, so a logged-out
  // visitor following a shared tag link gets a 401. That is a members-only
  // wall with a way through (CON-07), never "your search broke".
  const isSignedOut = error instanceof ApiError && error.status === 401;

  function runSearch(nextTerm: string) {
    const next = new URLSearchParams();
    if (nextTerm) next.set("q", nextTerm);
    // The tag and author filters survive a new term: the reader narrowed on
    // purpose. Clearing the term keeps them inside what they were browsing.
    if (tag) next.set("tag", tag);
    if (author) next.set("author", author);
    // PRD-110: the reader owns a pinned content language, so it survives a
    // new term the way the tag and author filters do.
    const pinnedLanguage = searchParams.get("lang");
    if (pinnedLanguage) next.set("lang", pinnedLanguage);
    setSearchParams(next);
  }

  const hasNoResults = hasCriteria && !isLoading && !isError && total === 0;

  return (
    <PageShell>
      <PageMeta
        title={t("magazine:search.metaTitle")}
        description={t("magazine:search.metaDescription")}
        canonical={routes.magazineSearch}
      />
      <MagazineMasthead active="search" />
      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.head}>
            <div className={styles.eyebrow}>{t("magazine:search.eyebrow")}</div>
            <h1 className={styles.h1}>{t("magazine:search.heading")}</h1>
            <MagazineSearchField defaultValue={term} onSearch={runSearch} />
            {tag && (
              <div className={styles.tagLine}>
                <span className={styles.tagLineLabel}>
                  {t("magazine:search.taggedLabel")}
                </span>
                <ArticleTagList tags={[tag]} activeTag={tag} />
              </div>
            )}
            {author && (
              <div className={styles.tagLine}>
                <span className={styles.tagLineLabel}>
                  {t("magazine:search.byAuthorLabel")}
                </span>
                {/* Content: the byline is the writer's own name. */}
                <Link
                  to={`${routes.author}/${encodeURIComponent(author)}`}
                  className={styles.authorLink}
                >
                  {authorName}
                </Link>
              </div>
            )}
            {hasCriteria && !isLoading && !isError && total > 0 && (
              <p className={styles.count}>
                {t("magazine:search.resultCount", { count: total })}
              </p>
            )}
          </div>

          {!hasCriteria ? (
            <EmptyState
              title={t("magazine:search.promptTitle")}
              description={t("magazine:search.promptBody")}
            />
          ) : isSignedOut ? (
            <MagazineSignInWall />
          ) : isError ? (
            <EmptyState
              title={t("magazine:search.errorTitle")}
              description={t("magazine:search.errorBody")}
              action={{
                label: t("magazine:search.retryCta"),
                onClick: refetch,
              }}
            />
          ) : hasNoResults ? (
            <EmptyState
              title={t("magazine:search.emptyTitle")}
              description={t("magazine:search.emptyBody")}
            />
          ) : (
            <MagazineArticleRows
              articles={articles}
              isLoading={isLoading}
              activeTag={tag || undefined}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMore}
            />
          )}
        </div>
      </section>
    </PageShell>
  );
}
