import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { HubBackLink } from "../../shared/components/ui";
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
  const [active, setActive] = useState("money");

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <HubBackLink to={routes.governance} label="Governance" tone="dark" />
          <div className={styles.eyebrow}>
            Annual transparency report · 2025
          </div>
          <h1 className={styles.h1}>
            Every <em>euro,</em> every <em>moderation,</em> every{" "}
            <em>mistake.</em>
          </h1>
          <p className={styles.dek}>
            The numbers behind QueerPulse in 2025 — finances, moderation
            actions, government requests, and the things we got wrong.{" "}
            <em>Published by Associação QueerPulse</em> on 14 May 2026, after
            independent review by Dra. Helena Faria (auditor).
          </p>
          <div className={styles.metaRow}>
            <span>
              <b>
                €<em>278</em>k
              </b>
              Total raised
            </span>
            <span>
              <b>
                <em>96</em>%
              </b>
              To programs
            </span>
            <span>
              <b>1,847</b>Active members
            </span>
            <span>
              <b>
                <em>3</em>
              </b>
              Public mistakes named
            </span>
          </div>
        </div>
      </section>

      <div className={styles.tabs}>
        <div className={styles.tabsInner}>
          {TABS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={[styles.tab, active === id && styles.tabActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActive(id)}
            >
              {label}
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
            2026 · in progress
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
