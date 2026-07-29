import { FiInfo } from "react-icons/fi";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import {
  useGovernanceOverview,
  type DecisionView,
  type PrincipleView,
} from "../governance/api/useGovernanceOverview";
import styles from "./AdminGovernancePage.module.css";

export function AdminGovernancePolicy() {
  const { decisions, principles, loading } = useGovernanceOverview();

  return (
    <FadeIn>
      <div className={styles.govGrid}>
        <DecisionTimeline decisions={decisions} loading={loading} />
        <div className={styles.policyRail}>
          <PrinciplesCard principles={principles} loading={loading} />
          <TransparencyNote />
        </div>
      </div>
    </FadeIn>
  );
}

function DecisionTimeline({
  decisions,
  loading,
}: {
  decisions: DecisionView[];
  loading: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.ledgerCard}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>
          <Translation
            i18nKey="admin:governance.policy.versionsTitle"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.cardSub}>
          {t("admin:governance.policy.versionsSub")}
        </p>
      </div>
      {loading ? (
        <div className={styles.timeline}>
          <SkeletonLine height={16} width="70%" style={{ marginBottom: 10 }} />
          <SkeletonLine height={16} width="85%" style={{ marginBottom: 10 }} />
          <SkeletonLine height={16} width="60%" />
        </div>
      ) : (
        <ol className={styles.timeline}>
          {decisions.map((decision) => (
            <DecisionTimelineItem key={decision.leadKey} decision={decision} />
          ))}
        </ol>
      )}
    </div>
  );
}

function DecisionTimelineItem({ decision }: { decision: DecisionView }) {
  const { t } = useTranslation();
  return (
    <li className={styles.tlItem}>
      <span className={styles.tlDot} aria-hidden />
      <div className={styles.tlBody}>
        <div className={styles.tlHead}>
          <span className={styles.tlVersion}>{t(decision.leadKey)}</span>
        </div>
        <p className={styles.tlNote}>{t(decision.bodyKey)}</p>
      </div>
    </li>
  );
}

function PrinciplesCard({
  principles,
  loading,
}: {
  principles: PrincipleView[];
  loading: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>
          <Translation
            i18nKey="admin:governance.policy.principlesTitle"
            components={{ em: <em /> }}
          />
        </h2>
      </div>
      {loading ? (
        <div className={styles.principles}>
          <SkeletonLine height={14} width="90%" style={{ marginBottom: 8 }} />
          <SkeletonLine height={14} width="75%" />
        </div>
      ) : (
        <ul className={styles.principles}>
          {principles.map((principle) => (
            <li key={principle.titleKey} className={styles.principle}>
              <span className={styles.principleIco} aria-hidden>
                <principle.icon />
              </span>
              {t(principle.titleKey)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TransparencyNote() {
  const { t } = useTranslation();
  return (
    <div className={styles.transpCard}>
      <FiInfo className={styles.transpIco} aria-hidden />
      <p className={styles.transpText}>
        {t("admin:governance.policy.transparencyNote")}
      </p>
    </div>
  );
}
