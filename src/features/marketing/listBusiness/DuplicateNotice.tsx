import { useTranslation } from "../../../shared/i18n/useTranslation";
import { catLabel, initials } from "./listBusiness.data";
import type { SimilarListing } from "./api/listings.api";
import styles from "./ListBusinessPage.module.css";

/** Directory look-alikes surfaced under the name field so people don't
 *  re-list an existing place. */
export function DuplicateNotice({ dups }: { dups: SimilarListing[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.dupNotice} role="alert">
      <div className={styles.dnHead}>
        {t("marketing:listBusiness.step1.dupHead")}
      </div>
      {dups.map((match) => (
        <div key={match.slug || match.name} className={styles.dupMatch}>
          <span className={styles.dmAv}>{initials(match.name)}</span>
          <span className={styles.dmInfo}>
            <b>{match.name}</b>
            <span>
              {catLabel(t, match.cat)} · {match.hood}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
