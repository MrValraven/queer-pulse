import { Link } from "react-router-dom";
import { FadeIn, SkeletonLine, Tag } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { relationReason, type Article } from "./data/articles";
import styles from "./ArticlePage.module.css";

function RelatedCardSkeleton({ className }: { className: string }) {
  return (
    <div className={className} aria-hidden>
      <SkeletonLine width="40%" height={11} />
      <SkeletonLine width="90%" height={17} style={{ marginTop: 2 }} />
      <SkeletonLine width="65%" height={13} style={{ marginTop: 2 }} />
      <SkeletonLine
        width={90}
        height={22}
        style={{ borderRadius: 999, marginTop: 4 }}
      />
    </div>
  );
}

/**
 * The "keep reading" rail under an article. Lifted out of `ArticlePage` so
 * that component stays under the repo's 200-line cap; the styles stay in
 * `ArticlePage.module.css`, which is where the rail's grid already lives.
 */
export function ArticleRelatedRail({
  article,
  related,
  isLoading,
}: {
  article: Article;
  related: Article[];
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  if (related.length === 0) return null;

  return (
    <div className={styles.related}>
      <div className="wrap">
        <div className={styles.relatedHead}>
          <Translation
            i18nKey="magazine:article.relatedHeading"
            components={{ em: <em /> }}
          />
        </div>
        <div className={styles.relGrid}>
          {isLoading
            ? related.map((relatedArticle) => (
                <RelatedCardSkeleton
                  key={relatedArticle.id}
                  className={styles.relCard!}
                />
              ))
            : related.map((relatedArticle, index) => (
                <FadeIn
                  as={Link}
                  key={relatedArticle.id}
                  to={`${routes.article}?id=${relatedArticle.id}`}
                  className={styles.relCard}
                  delay={Math.min(index, 8) * 60}
                >
                  <div className={styles.relKicker}>
                    {relatedArticle.section}
                  </div>
                  <div className={styles.relTitle}>{relatedArticle.title}</div>
                  <div className={styles.relMeta}>
                    {relatedArticle.byline} · {relatedArticle.readTime}
                  </div>
                  <Tag className={styles.relReason}>
                    {relationReason(article, relatedArticle, t)}
                  </Tag>
                </FadeIn>
              ))}
        </div>
      </div>
    </div>
  );
}
