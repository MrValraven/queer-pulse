import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MagazineCover } from "./MagazineCover";
import { MagazineMasthead } from "./MagazineMasthead";
import { MagazineSections } from "./MagazineSections";
import styles from "./MagazinePage.module.css";
import { NAV_ITEMS } from "./magazinePage.data";

export function MagazinePage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  return (
    <PageShell>
      <PageMeta
        title={t("magazine:landing.meta.title")}
        description={t("magazine:landing.meta.description")}
      />
      <MagazineMasthead active="current" />

      {/* Demo's front-of-book: a fixed anchor nav and a hand-written cover
          story, both pointing at article rails that only exist in demo. Live
          mode builds its own from the current issue's run order, inside
          `MagazineLiveSections` (CON-13), which is why this block stays
          demo-only rather than being shared. */}
      {demoMode && (
        <>
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
        </>
      )}

      <MagazineSections />
    </PageShell>
  );
}
