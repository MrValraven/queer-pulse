import { SectionHead } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCompanies } from "./api/useCompanies";
import { EmployerGrid } from "./EmployerGrid";

import styles from "./JobsPage.module.css";

/**
 * The "employers we trust" grid at the foot of the job board. Sources its
 * companies from `useCompanies` — demo returns the mock EMPLOYERS registry
 * (slugs pre-resolved) as one full page, live calls GET /companies page by page
 * behind the "Load more" button (which never shows in demo). Renders nothing at
 * all (heading included) while loading, on error, or with no employers.
 */
export function JobsEmployers() {
  const { t } = useTranslation();
  const {
    items: employers,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useCompanies();

  if (employers.length === 0) return null;

  return (
    <section className={styles.employers}>
      <div className="wrap">
        <SectionHead
          title={
            <Translation
              i18nKey="economy:jobs.employers.title"
              components={{ em: <em /> }}
            />
          }
          subtitle={t("economy:jobs.employers.subtitle")}
        />
        <EmployerGrid
          employers={employers}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>
    </section>
  );
}
