import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { SubpageIndex } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MagazineCover } from "./MagazineCover";
import { MagazineMasthead } from "./MagazineMasthead";
import { MagazineSections } from "./MagazineSections";
import styles from "./MagazinePage.module.css";
import { NAV_ITEMS, MAGAZINE_SUBPAGES } from "./magazinePage.data";

export function MagazinePage() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <PageMeta
        title={t("magazine:landing.meta.title")}
        description={t("magazine:landing.meta.description")}
      />
      <MagazineMasthead active="current" />

      <div className="wrap">
        <nav
          className={styles.inIssue}
          aria-label={t("magazine:landing.inIssueAriaLabel")}
        >
          <span className={styles.inIssueLabel}>
            {t("magazine:landing.inIssueLabel")}
          </span>
          <span className={styles.inIssueLinks}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.anchor}
                className={styles.inIssueLink}
                href={`#${item.anchor}`}
              >
                {t(item.labelKey)}
              </a>
            ))}
          </span>
        </nav>
      </div>

      <MagazineCover />

      <MagazineSections />

      <SubpageIndex
        title={t("magazine:landing.subpageIndexTitle")}
        items={MAGAZINE_SUBPAGES.map((subpage) => ({
          label: t(subpage.labelKey),
          to: subpage.to,
          blurb: t(subpage.blurbKey),
        }))}
      />
    </PageShell>
  );
}
