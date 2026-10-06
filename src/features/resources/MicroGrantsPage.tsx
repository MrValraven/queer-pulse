import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { HOW, RULES } from "./microGrants.data";
import {
  MicroGrantsLiveApplyCard,
  MicroGrantsPanelCard,
  MicroGrantsRoundCard,
  MicroGrantsShowcase,
} from "./MicroGrantsRound";
import { GrantApplicationModal } from "./GrantApplicationModal";
import { PanelSignupModal } from "./PanelSignupModal";
import { ContributeStrip, MicroGrantsHero } from "./MicroGrantsSections";
import styles from "./MicroGrantsPage.module.css";

const INVITE = requestInvitePath("micro_grants");

export function MicroGrantsPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
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

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              {demoMode ? (
                <>
                  <MicroGrantsRoundCard onApply={() => setOpen(true)} />
                  <MicroGrantsShowcase isLoading={loading} />
                </>
              ) : (
                <MicroGrantsLiveApplyCard onApply={() => setOpen(true)} />
              )}
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
              {demoMode && <MicroGrantsPanelCard />}
              <Button
                type="button"
                variant="ghost"
                className={styles.sbcBtn}
                onClick={() => setPanelOpen(true)}
              >
                {t("resources:microGrants.sidebar.joinPanelCta")}{" "}
                <FiArrowRight aria-hidden />
              </Button>
            </aside>
          </div>

          <ContributeStrip />
        </div>
      </div>

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
