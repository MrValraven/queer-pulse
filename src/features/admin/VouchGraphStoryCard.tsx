import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { describeSmallNetwork } from "./trustGraph/smallNetworkStory";
import { monthDate } from "./trustGraph/trustGraphModel";
import type { Translate } from "./trustGraph/trustPathSentence";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import styles from "./vouchGraphInspector.module.css";

const YEAR_MONTH_PATTERN = /^\d{4}-\d{2}$/;

/** D1: a short sentence for members with a small network, e.g. "Vouched for
 *  by Ana (verified) in Jul 2026, invited by Rui". Renders nothing when the
 *  member has no story to tell or too many connections for one. */
export function VouchGraphStoryCard({ personId }: { personId: string }) {
  const { t } = useTranslation();
  const format = useFormat();
  const graph = useTrustGraph();
  const translate: Translate = t;

  const formatMonth = (isoOrMonth: string): string => {
    const date = YEAR_MONTH_PATTERN.test(isoOrMonth)
      ? monthDate(isoOrMonth)
      : new Date(isoOrMonth);
    if (Number.isNaN(date.getTime())) return "";
    return format.date(date, { month: "short", year: "numeric" });
  };

  const story = describeSmallNetwork(graph, personId, translate, formatMonth);
  if (!story) return null;

  return (
    <section className={styles.infoCard}>
      <h4 className={styles.infoCardTitle}>
        {t("admin:vouchGraph.inspector.story.title")}
      </h4>
      <p className={styles.infoCardBody}>{story}</p>
    </section>
  );
}
