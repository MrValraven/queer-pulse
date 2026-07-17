import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import {
  CRITERIA_KEYS,
  CURRENT,
  HOW,
  PANEL,
  PAST,
  RULES,
} from "./microGrants.data";
import { GrantCard, GrantSkeleton } from "./GrantCard";
import { GrantApplicationModal } from "./GrantApplicationModal";
import { PanelSignupModal } from "./PanelSignupModal";
import { ContributeStrip, MicroGrantsHero } from "./MicroGrantsSections";
import styles from "./MicroGrantsPage.module.css";

const INVITE = routes.requestInvite;

export function MicroGrantsPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const loading = useSimulatedLoad();

  return (
    <PageShell>
      <MicroGrantsHero />

      <section className={styles.howSection}>
        <div className="wrap">
          <div className={styles.howGrid}>
            {HOW.map((h) => (
              <div className={styles.howItem} key={h.n}>
                <div className={styles.howN}>{h.n}</div>
                <div className={styles.howTitle}>{t(h.titleKey)}</div>
                <div className={styles.howBody}>{t(h.bodyKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <div className={styles.roundCard}>
                <div className={styles.rcLabel}>
                  <span className={styles.rcDot} />
                  {t("resources:microGrants.round.statusLabel")}
                </div>
                <div className={styles.rcTitle}>
                  <Translation
                    i18nKey="resources:microGrants.round.title"
                    components={{ em: <em /> }}
                  />
                </div>
                <p className={styles.rcDesc}>
                  {t("resources:microGrants.round.desc")}
                </p>
                <div className={styles.rcMeta}>
                  <div className={styles.rcm}>
                    <strong>€200 – €2,000</strong>
                    <span>
                      {t("resources:microGrants.round.meta.amountLabel")}
                    </span>
                  </div>
                  <div className={styles.rcm}>
                    <strong>30 June 2026</strong>
                    <span>
                      {t("resources:microGrants.round.meta.deadlineLabel")}
                    </span>
                  </div>
                  <div className={styles.rcm}>
                    <strong>3 – 4 weeks</strong>
                    <span>
                      {t("resources:microGrants.round.meta.decisionLabel")}
                    </span>
                  </div>
                </div>
                <div className={styles.rcCriteria}>
                  <div className={styles.rcCritTitle}>
                    {t("resources:microGrants.round.criteriaTitle")}
                  </div>
                  <div className={styles.critList}>
                    {CRITERIA_KEYS.map((criteriaKey) => (
                      <div className={styles.crit} key={criteriaKey}>
                        <span className={styles.critCheck}>
                          <FiCheck />
                        </span>
                        <span>{t(criteriaKey)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setOpen(true)}
                >
                  {t("resources:microGrants.round.applyCta")}
                </Button>
              </div>

              <div className={styles.grantsSection}>
                <div className={styles.gsHead}>
                  <Translation
                    i18nKey="resources:microGrants.section.currentTitle"
                    components={{ em: <em /> }}
                  />
                </div>
                <div className={styles.grantsGrid} aria-busy={loading}>
                  {loading
                    ? Array.from({ length: CURRENT.length }).map((_, i) => (
                        <GrantSkeleton key={i} />
                      ))
                    : CURRENT.map((g, i) => (
                        <FadeIn key={g.name} delay={Math.min(i, 8) * 60}>
                          <GrantCard g={g} />
                        </FadeIn>
                      ))}
                </div>
              </div>

              <div className={styles.grantsSection}>
                <div className={styles.gsHead}>
                  <Translation
                    i18nKey="resources:microGrants.section.pastTitle"
                    components={{ em: <em /> }}
                  />
                </div>
                <div className={styles.grantsGrid} aria-busy={loading}>
                  {loading
                    ? Array.from({ length: PAST.length }).map((_, i) => (
                        <GrantSkeleton key={i} />
                      ))
                    : PAST.map((g, i) => (
                        <FadeIn key={g.name} delay={Math.min(i, 8) * 60}>
                          <GrantCard g={g} />
                        </FadeIn>
                      ))}
                </div>
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.sbCard}>
                <div className={styles.sbcTitle}>
                  {t("resources:microGrants.sidebar.rulesTitle")}
                </div>
                {RULES.map((r) => (
                  <div className={styles.sbcRule} key={r.titleKey}>
                    <div className={styles.sbcRuleTitle}>{t(r.titleKey)}</div>
                    <div className={styles.sbcRuleBody}>{t(r.bodyKey)}</div>
                  </div>
                ))}
              </div>
              <div className={styles.sbCard}>
                <div className={styles.sbcTitle}>
                  {t("resources:microGrants.sidebar.panelTitle")}
                </div>
                {PANEL.map((p) => (
                  <div className={styles.sbcRule} key={p.title}>
                    <div className={styles.sbcRuleTitle}>{p.title}</div>
                    <div className={styles.sbcRuleBody}>{p.body}</div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                className={styles.sbcBtn}
                onClick={() => setPanelOpen(true)}
              >
                {t("resources:microGrants.sidebar.joinPanelCta")}
              </Button>
            </aside>
          </div>

          <ContributeStrip />
        </div>
      </main>

      <Outro
        title={
          <Translation
            i18nKey="resources:microGrants.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:microGrants.outro.sub")}
      >
        <Button to={INVITE} variant="primary" size="lg">
          {t("resources:microGrants.outro.joinCta")}
        </Button>
      </Outro>

      {open && <GrantApplicationModal onClose={() => setOpen(false)} />}
      {panelOpen && <PanelSignupModal onClose={() => setPanelOpen(false)} />}
    </PageShell>
  );
}
