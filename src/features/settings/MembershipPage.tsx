import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { FadeIn } from "../../shared/components/ui";
import { PlanPanel, BillingPanel, AccessPanel } from "./MembershipPanels";
import { routes } from "../../app/routeMap";
import { MembershipSidebar } from "./MembershipSidebar";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import styles from "./MembershipPage.module.css";

type Tab = "plan" | "billing" | "access";

export function MembershipPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("plan");

  const TABS: { key: Tab; label: string }[] = [
    { key: "plan", label: t("settings:membership.tabs.plan") },
    { key: "billing", label: t("settings:membership.tabs.billing") },
    { key: "access", label: t("settings:membership.tabs.access") },
  ];

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.bc}>
          <Link to={routes.homepage}>{t("settings:nav.item.account")}</Link>
          <span className={styles.bcSep}>›</span>
          <span className={styles.bcCurrent}>
            {t("settings:membership.breadcrumb.current")}
          </span>
        </div>
        <h1 className={styles.title}>
          <Translation
            i18nKey="settings:membership.page.title"
            components={{ em: <em /> }}
          />
        </h1>

        <div className={styles.layout}>
          <div>
            <div className={styles.tabs}>
              {TABS.map((tabDef) => (
                <button
                  type="button"
                  key={tabDef.key}
                  className={`${styles.tab} ${tab === tabDef.key ? styles.active : ""}`}
                  onClick={() => setTab(tabDef.key)}
                >
                  {tabDef.label}
                </button>
              ))}
            </div>

            <FadeIn key={tab}>
              {tab === "plan" && <PlanPanel />}
              {tab === "billing" && <BillingPanel />}
              {tab === "access" && <AccessPanel />}
            </FadeIn>
          </div>

          <MembershipSidebar />
        </div>
      </div>
    </AppShell>
  );
}
