import { useMemo } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { buildContribution, buildStatus } from "./membership.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import styles from "./MembershipPage.module.css";

export function MembershipSidebar() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const contribution = useMemo(() => buildContribution(t, fmt), [t, fmt]);
  const status = useMemo(() => buildStatus(t, fmt), [t, fmt]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sb}>
        <div className={styles.contribNum}>
          <em>{contribution.total}</em>
        </div>
        <div className={styles.contribLbl}>{contribution.label}</div>
        <div className={styles.contribSince}>{contribution.since}</div>
        {contribution.impacts.map((impact) => (
          <div key={impact} className={styles.impact}>
            <div className={styles.impactDot} />
            <span>{impact}</span>
          </div>
        ))}
      </div>

      <div className={styles.sb}>
        <div className={styles.statusPill}>
          <span className={styles.spillDot} />
          {t("settings:membership.sidebar.activeMember")}
        </div>
        <div className={styles.sbTierName}>{status.tier}</div>
        <div className={styles.nextRenewal}>{status.renewal}</div>
        <div className={styles.sbDivider} />
        <Link to={routes.solidarity} className={styles.sbLink}>
          {t("settings:membership.sidebar.solidarityLink")}
        </Link>
      </div>
    </aside>
  );
}
