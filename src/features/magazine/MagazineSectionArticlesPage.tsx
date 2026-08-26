import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { MagazineMasthead } from "./MagazineMasthead";
import { MagazineArticleRows } from "./MagazineArticleRows";
import { MagazineSearchLauncher } from "./MagazineSearchField";
import { useSectionArticles } from "./api/useSectionArticles";
import styles from "./MagazineSectionArticlesPage.module.css";

/**
 * CNT-20 — the drill-down for one `MagazineSectionsPage` tile: every
 * published piece whose `section` matches this URL segment
 * (`${routes.magazineSections}/:section`, decoded — a section like
 * "Last word" round-trips through `encodeURIComponent`/`decodeURIComponent`
 * on either side of the link).
 *
 * CON-12 — the rows now come from the shared `MagazineArticleRows`, so each
 * piece prints its tags as links into `?tag=`, and the masthead search field
 * is mounted here too: a reader who has drilled into a section is exactly the
 * reader who might want to search the rest of the archive.
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
      <div className="wrap">
        <MagazineSearchLauncher />
      </div>
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
            <MagazineArticleRows articles={articles} isLoading={isLoading} />
          )}
        </div>
      </section>
    </PageShell>
  );
}
