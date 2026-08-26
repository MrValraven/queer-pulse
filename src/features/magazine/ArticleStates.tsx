import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { MagazineLoadError } from "./MagazineLoadError";
import { MagazineSignInWall } from "./MagazineSignInWall";
import styles from "./ArticlePage.module.css";

/**
 * `ArticlePage`'s non-article branches, split out to keep that component under
 * the 200-line cap. All are `noIndex`: a crawler should never index an outage,
 * a missing slug is not a page worth ranking, and a members-only wall is not
 * the article whose URL it sits on.
 */
export function ArticleLoadFailed({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <PageShell>
      <PageMeta title={t("magazine:load.errorMetaTitle")} noIndex />
      <div className={`${styles.notFound} wrap`}>
        <MagazineLoadError onRetry={onRetry} />
      </div>
    </PageShell>
  );
}

/**
 * The skeleton-then-wall branch: live mode has no article until the fetch
 * resolves, so it shows a skeleton first and only calls the piece missing once
 * loading is done.
 */
export function ArticleNotFound({ isLoading }: { isLoading: boolean }) {
  const { t } = useTranslation();
  return (
    <PageShell>
      <PageMeta title={t("magazine:article.notFoundMetaTitle")} noIndex />
      <div className={`${styles.notFound} wrap`}>
        {isLoading ? (
          <>
            <SkeletonLine width="40%" height={20} />
            <SkeletonLine width="70%" height={32} style={{ marginTop: 12 }} />
            <SkeletonLine width="90%" height={16} style={{ marginTop: 12 }} />
          </>
        ) : (
          <>
            <h2>{t("magazine:article.notFoundTitle")}</h2>
            <p>{t("magazine:article.notFoundBody")}</p>
            <Button to={routes.magazine}>
              {t("magazine:article.notFoundCta")}
            </Button>
          </>
        )}
      </div>
    </PageShell>
  );
}

/**
 * CON-07 — a logged-out visitor following a shared article link. Every
 * magazine read sits behind `ActiveMemberGuard`, so their request comes back
 * 401. This says so and offers the way through: `MagazineSignInWall` builds a
 * `?next=` back to the article they were trying to read, so signing in lands
 * them on the piece rather than the magazine front.
 */
export function ArticleSignInRequired() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <PageMeta title={t("magazine:signInWall.title")} noIndex />
      <div className={`${styles.notFound} wrap`}>
        <MagazineSignInWall />
      </div>
    </PageShell>
  );
}
