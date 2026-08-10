import type { IssueProductionDto } from "../../api/issueProduction.api";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "../../IssueProductionPage.module.css";
import tabStyles from "../pieceTabs.module.css";

export interface PagesCardProps {
  pages: IssueProductionDto["pages"];
}

/** Editorial/total page-count bars in the issue-production `.erail`, plus how many pages are still spare against the issue's page max. */
export function PagesCard({ pages }: PagesCardProps) {
  const { t } = useTranslation();
  const pagesSpare = pages.max - pages.total;

  return (
    <div className={tabStyles.card}>
      <h3>{t("magazine:issue.pages.heading")}</h3>
      <div className={styles.pagesRow}>
        <span>{t("magazine:issue.pages.editorial")}</span>
        <b>{pages.editorial}</b>
      </div>
      <div className={tabStyles.prog}>
        <i style={{ width: `${(pages.editorial / pages.max) * 100}%` }} />
      </div>
      <div className={styles.pagesRow}>
        <span>{t("magazine:issue.pages.total")}</span>
        <b>
          {pages.total}/{pages.max}
        </b>
      </div>
      <div className={tabStyles.prog}>
        <i style={{ width: `${(pages.total / pages.max) * 100}%` }} />
      </div>
      <p className={tabStyles.tiny}>
        {t("magazine:issue.pages.spare", { count: pagesSpare })}
      </p>
    </div>
  );
}
