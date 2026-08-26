import { useSearchParams } from "react-router-dom";
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
 * THE URL IS THE STATE. `?q=` and `?tag=` drive the results and seed the
 * field, so a search is shareable, the back button works, and a tag pill
 * anywhere in the magazine can link straight into this page. The two combine:
 * a tag can be narrowed with a term.
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
  const { articles, total, isLoading, isError, error, refetch, hasCriteria } =
    useMagazineSearch({ q: term, tag });
  // Every magazine read sits behind `ActiveMemberGuard`, so a logged-out
  // visitor following a shared tag link gets a 401. That is a members-only
  // wall with a way through (CON-07), never "your search broke".
  const isSignedOut = error instanceof ApiError && error.status === 401;

  function runSearch(nextTerm: string) {
    const next = new URLSearchParams();
    if (nextTerm) next.set("q", nextTerm);
    // The tag filter survives a new term: the reader narrowed a tag on
    // purpose. Clearing the term keeps them inside the tag they were browsing.
    if (tag) next.set("tag", tag);
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
            />
          )}
        </div>
      </section>
    </PageShell>
  );
}
