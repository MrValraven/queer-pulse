import { useState } from "react";
import { FiFileText } from "react-icons/fi";
import { PageShell, PageHero } from "../../shared/components/layout";
import { EmptyState, HubBackLink } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { TABS } from "./transparencyReport.data";
import {
  GovernanceSection,
  MistakesSection,
  ModerationSection,
  MoneySection,
  PeopleSection,
  RequestsSection,
  Signoff,
} from "./TransparencyReportSections";
import styles from "./TransparencyReportPage.module.css";

export function TransparencyReportPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [active, setActive] = useState("money");
  const pageTitle = t("marketing:transparency.meta.title");
  const pageDescription = t("marketing:transparency.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: t("marketing:hub.governanceLabel"), path: routes.governance },
          { name: pageTitle, path: routes.transparencyReport },
        ])}
      />
      <PageHero
        backLink={
          <HubBackLink
            to={routes.governance}
            label={t("marketing:hub.governanceLabel")}
            tone="dark"
          />
        }
        eyebrow={t("marketing:transparency.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:transparency.hero.title"
            components={{ em: <em /> }}
          />
        }
      >
        <p className={`${styles.dek} ${styles.heroExtra}`}>
          <Translation
            i18nKey="marketing:transparency.hero.dek"
            components={{ em: <em /> }}
          />
        </p>
        {demoMode && (
          <div className={styles.metaRow}>
            <span>
              <b>
                €<em>278</em>k
              </b>
              {t("marketing:transparency.hero.meta.raised")}
            </span>
            <span>
              <b>
                <em>96</em>%
              </b>
              {t("marketing:transparency.hero.meta.toPrograms")}
            </span>
            <span>
              <b>1,847</b>
              {t("marketing:transparency.hero.meta.activeMembers")}
            </span>
            <span>
              <b>
                <em>3</em>
              </b>
              {t("marketing:transparency.hero.meta.mistakesNamed")}
            </span>
          </div>
        )}
      </PageHero>

      {demoMode ? (
        <>
          <div className={styles.tabs}>
            <div className={styles.tabsInner}>
              {TABS.map(([id, labelKey]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={[styles.tab, active === id && styles.tabActive]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setActive(id)}
                >
                  {t(labelKey)}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.page}>
            <div className={styles.yearSwitch}>
              <a
                href="#money"
                className={`${styles.yearBtn} ${styles.yearCurrent}`}
              >
                2025
              </a>
              <a href="#money" className={styles.yearBtn}>
                2024
              </a>
              <a
                href="#money"
                className={`${styles.yearBtn} ${styles.yearFuture}`}
              >
                2026 · {t("marketing:transparency.yearSwitch.inProgress")}
              </a>
            </div>

            <MoneySection />
            <PeopleSection />
            <ModerationSection />
            <RequestsSection />
            <MistakesSection />
            <GovernanceSection />
            <Signoff />

            <div style={{ padding: "80px 0 40px" }} />
          </div>
        </>
      ) : (
        <div className={styles.page}>
          <EmptyState
            icon={<FiFileText />}
            title={t("marketing:transparency.live.title")}
            description={t("marketing:transparency.live.description")}
          />
          <div style={{ padding: "80px 0 40px" }} />
        </div>
      )}
    </PageShell>
  );
}
