import { FiCheck } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CRITERIA_KEYS, CURRENT, PANEL, PAST } from "./microGrants.data";
import { GrantCard, GrantSkeleton } from "./GrantCard";
import styles from "./MicroGrantsPage.module.css";

// DEMO ONLY: the Q2 2026 round, its recipients and its review panel are
// invented. Live mode renders `MicroGrantsLiveApplyCard` in their place, so a
// member never reads a deadline, an amount or a name that no backend holds.

export function MicroGrantsRoundCard({ onApply }: { onApply: () => void }) {
  const { t } = useTranslation();
  return (
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
      <p className={styles.rcDesc}>{t("resources:microGrants.round.desc")}</p>
      <div className={styles.rcMeta}>
        <div className={styles.rcm}>
          <strong>€200 – €2,000</strong>
          <span>{t("resources:microGrants.round.meta.amountLabel")}</span>
        </div>
        <div className={styles.rcm}>
          <strong>{t("resources:microGrants.round.meta.deadlineValue")}</strong>
          <span>{t("resources:microGrants.round.meta.deadlineLabel")}</span>
        </div>
        <div className={styles.rcm}>
          <strong>{t("resources:microGrants.round.meta.decisionValue")}</strong>
          <span>{t("resources:microGrants.round.meta.decisionLabel")}</span>
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
      <Button type="button" variant="primary" onClick={onApply}>
        {t("resources:microGrants.round.applyCta")}
      </Button>
    </div>
  );
}

export function MicroGrantsShowcase({ isLoading }: { isLoading: boolean }) {
  return (
    <>
      <ShowcaseSection
        titleKey="resources:microGrants.section.currentTitle"
        grants={CURRENT}
        isLoading={isLoading}
      />
      <ShowcaseSection
        titleKey="resources:microGrants.section.pastTitle"
        grants={PAST}
        isLoading={isLoading}
      />
    </>
  );
}

function ShowcaseSection({
  titleKey,
  grants,
  isLoading,
}: {
  titleKey: string;
  grants: typeof CURRENT;
  isLoading: boolean;
}) {
  return (
    <div className={styles.grantsSection}>
      <div className={styles.gsHead}>
        <Translation i18nKey={titleKey} components={{ em: <em /> }} />
      </div>
      <div className={styles.grantsGrid} aria-busy={isLoading}>
        {isLoading
          ? grants.map((grant) => <GrantSkeleton key={grant.name} />)
          : grants.map((grant, index) => (
              <FadeIn key={grant.name} delay={Math.min(index, 8) * 60}>
                <GrantCard g={grant} />
              </FadeIn>
            ))}
      </div>
    </div>
  );
}

export function MicroGrantsPanelCard() {
  const { t } = useTranslation();
  return (
    <div className={styles.sbCard}>
      <div className={styles.sbcTitle}>
        {t("resources:microGrants.sidebar.panelTitle")}
      </div>
      {PANEL.map((member) => (
        <div className={styles.sbcRule} key={member.title}>
          <div className={styles.sbcRuleTitle}>{member.title}</div>
          <div className={styles.sbcRuleBody}>{member.body}</div>
        </div>
      ))}
    </div>
  );
}

/** Live mode: the application form, with nothing invented around it. */
export function MicroGrantsLiveApplyCard({ onApply }: { onApply: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.roundCard}>
      <div className={styles.rcTitle}>
        <Translation
          i18nKey="resources:microGrants.live.applyTitle"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.rcDesc}>
        {t("resources:microGrants.live.applyBody")}
      </p>
      <Button type="button" variant="primary" onClick={onApply}>
        {t("resources:microGrants.live.applyCta")}
      </Button>
    </div>
  );
}
