import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
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
  const { sections, isLoading, isError } = useMagazineSections();
  const showEmpty = !isLoading && (isError || sections.length === 0);

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

          {showEmpty ? (
            <EmptyState
              title={
                isError
                  ? t("magazine:sections.errorTitle")
                  : t("magazine:sections.emptyTitle")
              }
              description={
                isError
                  ? t("magazine:sections.errorBody")
                  : t("magazine:sections.emptyBody")
              }
            />
          ) : (
            <MagazineSectionGrid sections={sections} isLoading={isLoading} />
          )}
        </div>
      </section>
    </PageShell>
  );
}
