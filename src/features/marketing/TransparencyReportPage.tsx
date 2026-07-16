import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { HubBackLink } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
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
  const [active, setActive] = useState("money");

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <HubBackLink
            to={routes.governance}
            label={t("marketing:hub.governanceLabel")}
            tone="dark"
          />
          <div className={styles.eyebrow}>
            {t("marketing:transparency.hero.eyebrow")}
          </div>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="marketing:transparency.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.dek}>
            <Translation
              i18nKey="marketing:transparency.hero.dek"
              components={{ em: <em /> }}
            />
          </p>
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
        </div>
      </section>

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
          <a href="#money" className={`${styles.yearBtn} ${styles.yearFuture}`}>
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
    </PageShell>
  );
}
