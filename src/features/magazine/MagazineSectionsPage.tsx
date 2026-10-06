import { PageShell } from "../../shared/components/layout";
import { EmptyState, LoadErrorState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MagazineMasthead } from "./MagazineMasthead";
import { MagazineSectionGrid } from "./MagazineSectionGrid";
import { MagazineSearchLauncher } from "./MagazineSearchField";
import { useMagazineSections } from "./api/useMagazineSections";
import styles from "./MagazineSectionsPage.module.css";

/**
 * CNT-20 — the magazine's section/topic taxonomy browse. Before this page
 * existed there was no way to browse the magazine by section (Cover,
 * Features, Reported, Interview, Essays, Service, Photo, Review, Column,
 * "Last word") despite `section` being a populated field on every published
 * article — the only entry points were the front page, an issue, an author,
 * or a direct link. One tile per section here, each linking to that
 * section's filtered article list.
 */
export function MagazineSectionsPage() {
  const { t } = useTranslation();
  const { sections, isLoading, hasFailedWithoutData, isRetrying, refetch } =
    useMagazineSections();
  // ENG-501b: a failed read gets the error panel with Retry, which stays
  // mounted (and keeps focus on its button) while the retry runs.
  const showEmpty = !isLoading && sections.length === 0;

  return (
    <PageShell>
      <MagazineMasthead active="sections" />
      {/* CON-12 — the archive's search field, mounted under the masthead on
          the magazine's browse hub. Sections answer "what kinds of pieces do
          you run"; search answers "have you written about this". */}
      <div className="wrap">
        <MagazineSearchLauncher />
      </div>
      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.head}>
            <div className={styles.eyebrow}>
              {t("magazine:sections.eyebrow")}
            </div>
            <h1 className={styles.h1}>{t("magazine:sections.title")}</h1>
            <p className={styles.sub}>{t("magazine:sections.sub")}</p>
          </div>

          {hasFailedWithoutData ? (
            <LoadErrorState
              headingLevel={2}
              title={t("magazine:sections.errorTitle")}
              description={t("magazine:sections.errorBody")}
              onRetry={refetch}
              isRetrying={isRetrying}
            />
          ) : showEmpty ? (
            <EmptyState
              title={t("magazine:sections.emptyTitle")}
              description={t("magazine:sections.emptyBody")}
            />
          ) : (
            <MagazineSectionGrid sections={sections} isLoading={isLoading} />
          )}
        </div>
      </section>
    </PageShell>
  );
}
