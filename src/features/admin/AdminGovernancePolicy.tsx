import { useState } from "react";
import { FiCheck, FiInfo } from "react-icons/fi";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminChip } from "./ui";
import {
  CARE_VERSIONS,
  PRINCIPLE_KEYS,
  type CareVersion,
} from "./adminGovernance.data";
import { AdminGovernanceDiffModal } from "./AdminGovernanceDiffModal";
import styles from "./AdminGovernancePage.module.css";

export function AdminGovernancePolicy() {
  const [diffOpen, setDiffOpen] = useState(false);

  return (
    <FadeIn>
      <div className={styles.govGrid}>
        <VersionTimeline onSeeDiff={() => setDiffOpen(true)} />
        <div className={styles.policyRail}>
          <PrinciplesCard />
          <TransparencyNote />
        </div>
      </div>
      {diffOpen && (
        <AdminGovernanceDiffModal onClose={() => setDiffOpen(false)} />
      )}
    </FadeIn>
  );
}

function VersionTimeline({ onSeeDiff }: { onSeeDiff: () => void }) {
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
      <ol className={styles.timeline}>
        {CARE_VERSIONS.map((v) => (
          <TimelineItem key={v.version} v={v} onSeeDiff={onSeeDiff} />
        ))}
      </ol>
    </div>
  );
}

function TimelineItem({
  v,
  onSeeDiff,
}: {
  v: CareVersion;
  onSeeDiff: () => void;
}) {
  const { t } = useTranslation();
  return (
    <li
      className={[styles.tlItem, v.current && styles.tlItemOn]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[styles.tlDot, v.current && styles.tlDotOn]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      />
      <div className={styles.tlBody}>
        <div className={styles.tlHead}>
          <span className={styles.tlVersion}>{v.version}</span>
          {/* v.badge/date/note: versioned policy-changelog content, mirrors
              API-fetched history in live mode — left in English per scope rule. */}
          {v.badge && <AdminChip tone={v.badgeTone}>{v.badge}</AdminChip>}
          <span className={styles.tlDate}>{v.date}</span>
        </div>
        <p className={styles.tlNote}>{v.note}</p>
        {v.current && (
          <button
            type="button"
            className={styles.tlDiffLink}
            onClick={onSeeDiff}
          >
            {t("admin:governance.policy.seeDiffCta")} →
          </button>
        )}
      </div>
    </li>
  );
}

function PrinciplesCard() {
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
      <ul className={styles.principles}>
        {PRINCIPLE_KEYS.map((key) => (
          <li key={key} className={styles.principle}>
            <span className={styles.principleIco} aria-hidden>
              <FiCheck />
            </span>
            {t(`admin:${key}`)}
          </li>
        ))}
      </ul>
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
