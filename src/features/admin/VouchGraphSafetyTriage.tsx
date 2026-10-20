import { FiShield } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import { VouchGraphCaseRow } from "./VouchGraphCaseRow";
import styles from "./vouchGraphTriage.module.css";

interface VouchGraphSafetyTriageProps {
  onFocusCase: (subjectId: string) => void;
}

/** B1: the Safety tab's home view, "Cases to review". Rows keep the order
 *  the backend ranked them in. The count is the platform-wide total, so it
 *  matches the Safety tab pill and the members page badge. */
export function VouchGraphSafetyTriage({
  onFocusCase,
}: VouchGraphSafetyTriageProps) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const { cases, openCaseCount } = graph;
  const hasCases = cases.length > 0;

  return (
    <section className={styles.triage} aria-labelledby="vouch-triage-title">
      <header className={styles.triageHead}>
        <h3 id="vouch-triage-title" className={styles.triageTitle}>
          {t("admin:vouchGraph.triage.title")}
        </h3>
        <span className={styles.triageCount}>
          {t("admin:vouchGraph.triage.count", { count: openCaseCount })}
        </span>
      </header>
      {hasCases ? (
        <ul
          className={styles.caseList}
          aria-label={t("admin:vouchGraph.triage.listAriaLabel")}
        >
          {cases.map((trustCase) => (
            <VouchGraphCaseRow
              key={trustCase.id}
              trustCase={trustCase}
              onFocusCase={onFocusCase}
            />
          ))}
        </ul>
      ) : (
        <div className={styles.triageEmpty}>
          <span className={styles.triageEmptyIcon}>
            <FiShield aria-hidden />
          </span>
          <p>{t("admin:vouchGraph.triage.empty")}</p>
        </div>
      )}
    </section>
  );
}
