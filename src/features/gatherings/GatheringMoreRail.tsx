import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { gatheringPath, spotsText, type GatheringDetail } from "./data";
import styles from "./GatheringPage.module.css";

/** The "more gatherings" rail beneath a gathering — demo-only (no live list
 *  endpoint), so it's rendered only when there are other gatherings to show. */
export function GatheringMoreRail({ others }: { others: GatheringDetail[] }) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.other}>
      <h2>
        <Translation
          i18nKey="gatherings:gathering.moreTitle"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.cards}>
        {others.map((other) => (
          <Link
            key={other.slug}
            to={gatheringPath(other.slug)}
            className={styles.card}
          >
            <div className={styles.dateMini}>
              <div className={styles.gd}>
                {fmt.date(other.date, { day: "2-digit" })}
              </div>
              <div className={styles.gm}>
                {fmt.date(other.date, { month: "short" })}
              </div>
            </div>
            <div>
              <div className={styles.cardType}>{other.type}</div>
              <h3 className={styles.cardTitle}>{other.title}</h3>
              <div className={styles.cardHood}>
                {other.hood} · {spotsText(other.spots, t, fmt)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
