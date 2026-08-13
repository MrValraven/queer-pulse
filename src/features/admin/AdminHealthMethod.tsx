import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  BREAKDOWN_META,
  HEALTH_BANDS,
  HEALTH_WEIGHTS,
  healthBand,
  healthWorkedExample,
  type Community,
} from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

/** Rows explaining what each signal measures and how much it counts. */
function SignalWeights() {
  const { t } = useTranslation();
  return (
    <div className={styles.methodSection}>
      <div className={styles.methodLabel}>
        {t("admin:communities.health.method.signalsHeading")}
      </div>
      <div className={styles.wList}>
        {BREAKDOWN_META.map((signalMeta, signalIndex) => {
          const weight = HEALTH_WEIGHTS[signalIndex]!;
          const counted = weight > 0;
          return (
            <div key={signalMeta.id} className={styles.wRow}>
              <div className={styles.wText}>
                <div className={styles.wName}>
                  {t(`admin:${signalMeta.nameKey}`)}
                </div>
                <div className={styles.wDesc}>
                  {t(`admin:${signalMeta.descriptionKey}`)}
                </div>
              </div>
              {counted ? (
                <div className={styles.wChip}>{Math.round(weight * 100)}%</div>
              ) : (
                <div className={styles.wChipMuted}>
                  {t("admin:communities.health.method.weightNotCounted")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** The community's own signals rolled up, reconciling to the published score. */
function WorkedExample({ community }: { community: Community }) {
  const { t } = useTranslation();
  const example = healthWorkedExample(community);
  if (example.rows.length === 0) return null;
  const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
  return (
    <div className={styles.methodSection}>
      <div className={styles.methodLabel}>
        {t("admin:communities.health.method.exampleTitle")}
      </div>
      <div className={styles.exBox}>
        {example.rows.map((row) => (
          <div key={row.nameKey} className={styles.exRow}>
            <span className={styles.exName}>{t(`admin:${row.nameKey}`)}</span>
            <span className={styles.exMath}>
              {row.value} &times; {row.weightPercent}%
            </span>
            <span className={styles.exVal}>{row.contribution}</span>
          </div>
        ))}
        <div className={styles.exRule} />
        <div className={styles.exRow}>
          <span className={styles.exName}>
            {t("admin:communities.health.method.exampleSubtotal")}
          </span>
          <span className={styles.exMath} />
          <span className={styles.exVal}>{example.subtotal}</span>
        </div>
        <div className={styles.exRow}>
          <span className={styles.exName}>
            {t("admin:communities.health.method.exampleSizeAdjust")}
          </span>
          <span className={styles.exMath} />
          <span className={styles.exVal}>{signed(example.sizeAdjust)}</span>
        </div>
        <div className={styles.exRule} />
        <div className={`${styles.exRow} ${styles.exTotal}`}>
          <span className={styles.exName}>
            {t("admin:communities.health.method.examplePublished")}
          </span>
          <span className={styles.exMath} />
          <span className={styles.exVal}>{example.published}</span>
        </div>
      </div>
      <p className={styles.exNote}>
        {t("admin:communities.health.method.exampleNote")}
      </p>
    </div>
  );
}

/** The three score bands, with the community's current band marked. */
function BandLegend({ community }: { community: Community }) {
  const { t } = useTranslation();
  const current = healthBand(community.health);
  return (
    <div className={styles.methodSection}>
      <div className={styles.methodLabel}>
        {t("admin:communities.health.method.bandsHeading")}
      </div>
      <div className={styles.bandList}>
        {HEALTH_BANDS.map((band) => {
          const here = band.id === current;
          return (
            <div key={band.id} className={styles.bandRow}>
              <span
                className={styles.bandDot}
                style={{ background: band.color }}
                aria-hidden
              />
              <span className={styles.bandLabel}>
                {t(`admin:${band.labelKey}`)}
              </span>
              {here && (
                <span className={styles.bandHere}>
                  {t("admin:communities.health.method.bandCurrent")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminHealthMethod({ community }: { community: Community }) {
  const { t } = useTranslation();
  return (
    <div className={styles.method}>
      <p className={styles.methodFormula}>
        {t("admin:communities.health.method.formula")}
      </p>
      <SignalWeights />
      <WorkedExample community={community} />
      <p className={styles.methodSizeNote}>
        {t("admin:communities.health.method.sizeNote")}
      </p>
      <BandLegend community={community} />
    </div>
  );
}
