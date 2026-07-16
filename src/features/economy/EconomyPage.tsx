import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { JOBS, MENTORSHIP, type Tab } from "./economy.data";
import { FreelanceTab, IncubatorTab, SalaryTab } from "./EconomyTabs";
import styles from "./EconomyPage.module.css";

const TAB_LABEL_KEYS: Record<Tab, string> = {
  incubator: "economy:hub.tab.incubator",
  freelance: "economy:hub.tab.freelance",
  salary: "economy:hub.tab.salary",
};

export function EconomyPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("incubator");

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>{t("economy:hub.eyebrow")}</div>
          <h1>
            <Translation i18nKey="economy:hub.title" components={{ em: <em /> }} />
          </h1>
          <p className={styles.lead}>{t("economy:hub.lead")}</p>
          <div className={styles.tabs}>
            {(["incubator", "freelance", "salary"] as Tab[]).map((tabId) => (
              <button
                key={tabId}
                type="button"
                className={[styles.tab, tab === tabId && styles.tabActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setTab(tabId)}
              >
                {t(TAB_LABEL_KEYS[tabId])}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          {tab === "incubator" && <IncubatorTab />}
          {tab === "freelance" && <FreelanceTab />}
          {tab === "salary" && <SalaryTab />}
        </div>
      </div>

      <Outro
        title={
          <Translation i18nKey="economy:hub.outro.title" components={{ em: <em /> }} />
        }
        sub={t("economy:hub.outro.sub")}
      >
        <Button to={JOBS} variant="primary" size="lg">
          {t("economy:hub.outro.browseCta")}
        </Button>
        <Button to={MENTORSHIP} variant="ghost-dark" size="lg">
          {t("economy:hub.outro.hostCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
