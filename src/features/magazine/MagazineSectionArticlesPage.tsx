import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { MagazineMasthead } from "./MagazineMasthead";
import { useSectionArticles } from "./api/useSectionArticles";
import { firstPlainText } from "./data/articles";
import styles from "./MagazineSectionArticlesPage.module.css";

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
 * CNT-20 — the drill-down for one `MagazineSectionsPage` tile: every
 * published piece whose `section` matches this URL segment
 * (`${routes.magazineSections}/:section`, decoded — a section like
 * "Last word" round-trips through `encodeURIComponent`/`decodeURIComponent`
 * on either side of the link).
 */
export function MagazineSectionArticlesPage() {
  const { t } = useTranslation();
  const { section: sectionParam = "" } = useParams();
  const section = decodeURIComponent(sectionParam);
  const { articles, isLoading, isError } = useSectionArticles(section);
  const showEmpty = !isLoading && (isError || articles.length === 0);

  return (
    <PageShell>
      <PageMeta
        title={t("magazine:sectionArticles.metaTitle", { section })}
        description={t("magazine:sectionArticles.metaDescription", { section })}
        canonical={`${routes.magazineSections}/${sectionParam}`}
      />
      <MagazineMasthead active="sections" />
      <section className={styles.body}>
        <div className="wrap">
          <Link to={routes.magazineSections} className={styles.back}>
            <FiArrowLeft aria-hidden /> {t("magazine:sectionArticles.backCta")}
          </Link>
          <div className={styles.head}>
            <div className={styles.eyebrow}>
              {t("magazine:sectionArticles.eyebrow")}
            </div>
            {/* Content: the section name is the writer-facing taxonomy label
                itself, rendered as-is and left untranslated. */}
            <h1 className={styles.h1}>{section}</h1>
          </div>

          {showEmpty ? (
            <EmptyState
              title={
                isError
                  ? t("magazine:sectionArticles.errorTitle")
                  : t("magazine:sectionArticles.emptyTitle")
              }
              description={
                isError
                  ? t("magazine:sectionArticles.errorBody")
                  : t("magazine:sectionArticles.emptyBody")
              }
            />
          ) : (
            <div className={styles.list}>
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <ArticleRowSkeleton key={index} />
                  ))
                : articles.map((article) => {
                    const dek = firstPlainText(article.body);
                    return (
                      <Link
                        key={article.id}
                        to={`${routes.article}?id=${article.id}`}
                        className={styles.row}
                      >
                        <h2 className={styles.rowTitle}>{article.title}</h2>
                        {dek && <p className={styles.rowDek}>{dek}</p>}
                        <p className={styles.rowMeta}>
                          {article.byline} · {article.date} · {article.readTime}
                        </p>
                      </Link>
                    );
                  })}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
