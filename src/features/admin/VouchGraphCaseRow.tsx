import type { IconType } from "react-icons";
import { FiAlertTriangle, FiFlag, FiRepeat } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { describeTrustCase } from "./trustGraph/trustCaseText";
import type { TrustCase, TrustCaseKind } from "./trustGraph/trustGraphModel";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import styles from "./vouchGraphTriage.module.css";

const KIND_ICON: Record<TrustCaseKind, IconType> = {
  ring: FiRepeat,
  flagged: FiFlag,
  isolated: FiAlertTriangle,
};

interface VouchGraphCaseRowProps {
  trustCase: TrustCase;
  onFocusCase: (subjectId: string) => void;
}

/** B1: one triage row. The whole row is a button that focuses the network
 *  on the case subject; a subject the loaded graph does not hold carries the
 *  "Outside this view" tag (clicking it refetches around them). */
export function VouchGraphCaseRow({
  trustCase,
  onFocusCase,
}: VouchGraphCaseRowProps) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const subject = graph.peopleById[trustCase.subjectId];
  const isOutsideView = !subject;
  const subjectName = subject?.name ?? trustCase.subjectName;
  const kindLabel = t(`admin:vouchGraph.triage.kind.${trustCase.kind}`);
  const reasonLine = describeTrustCase(trustCase, t);
  const outsideLabel = t("admin:vouchGraph.triage.outsideView");
  const spokenReason = [kindLabel, reasonLine]
    .concat(isOutsideView ? [outsideLabel] : [])
    .join(". ");
  const KindIcon = KIND_ICON[trustCase.kind];

  return (
    <li>
      <button
        type="button"
        className={styles.caseRow}
        data-kind={trustCase.kind}
        onClick={() => onFocusCase(trustCase.subjectId)}
        aria-label={t("admin:vouchGraph.triage.rowAria", {
          name: subjectName,
          reason: spokenReason,
        })}
      >
        <span className={styles.caseIcon}>
          <KindIcon aria-hidden />
        </span>
        <span className={styles.caseText}>
          <span className={styles.caseKind}>{kindLabel}</span>
          <span className={styles.caseName}>{subjectName}</span>
          <span className={styles.caseReason}>{reasonLine}</span>
          {isOutsideView && (
            <span className={styles.outsideTag}>{outsideLabel}</span>
          )}
        </span>
      </button>
    </li>
  );
}
