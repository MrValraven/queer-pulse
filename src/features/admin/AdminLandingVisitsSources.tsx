import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { LandingVisitsSource } from "./api/adminLandingVisits.api";
import { sourceDisplayName } from "./adminLandingVisitsSources.data";
import styles from "./AdminLandingVisitsCard.module.css";

/** The source the backend records when a visit arrived with no `utm_source`
 *  and no outside referrer. */
const DIRECT_SOURCE = "direct";

interface NamedSource {
  name: string;
  visits: number;
}

/** Rows named for a reader, with hosts that share a name (facebook.com and
 *  l.facebook.com) folded into one row, busiest first. */
function nameSources(
  sources: readonly LandingVisitsSource[],
  directLabel: string,
): NamedSource[] {
  const visitsByName = new Map<string, number>();
  for (const entry of sources) {
    const name =
      entry.source === DIRECT_SOURCE
        ? directLabel
        : sourceDisplayName(entry.source);
    visitsByName.set(name, (visitsByName.get(name) ?? 0) + entry.visits);
  }
  return Array.from(visitsByName, ([name, visits]) => ({ name, visits })).sort(
    (first, second) => second.visits - first.visits,
  );
}

/**
 * The busiest sources over the range, busiest first, each with a quiet bar
 * scaled against the top one so the ranking reads at a glance.
 */
export function AdminLandingVisitsSources({
  sources,
}: {
  sources: readonly LandingVisitsSource[];
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const namedSources = nameSources(
    sources,
    t("admin:dashboard.landingVisits.sourceDirect"),
  );
  const topVisits = namedSources[0]?.visits ?? 0;

  if (namedSources.length === 0) return null;

  return (
    <section className={styles.sources}>
      <h3 className={styles.sourcesTitle}>
        {t("admin:dashboard.landingVisits.topSources")}
      </h3>
      <ol className={styles.sourceList}>
        {namedSources.map((entry) => {
          const share = topVisits > 0 ? entry.visits / topVisits : 0;
          return (
            <li key={entry.name} className={styles.sourceRow}>
              <span className={styles.sourceName}>{entry.name}</span>
              <span className={styles.sourceTrack} aria-hidden>
                <span
                  className={styles.sourceFill}
                  style={{ transform: `scaleX(${share})` }}
                />
              </span>
              <span className={styles.sourceCount}>
                {fmt.number(entry.visits)}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
