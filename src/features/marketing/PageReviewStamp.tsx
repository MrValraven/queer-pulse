import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./PageReviewStamp.module.css";

/**
 * "Last reviewed by the QueerPulse team on 6 September 2026", plus a page-
 * specific line telling the reader to check the live figure themselves.
 *
 * A guidance page carries facts that go stale at different speeds. A statute
 * ("five years to citizenship") holds for years; a euro amount ("the income
 * threshold is X") is wrong the moment the minimum wage is reset, and somebody
 * may have sized a visa application on it. The pages this stamp sits on now
 * name the rule and the office that publishes the number, and this line says
 * when a person last read the page and that the reader should confirm the
 * figure at the source before they act on it.
 *
 * It deliberately promises NO cadence: there is no scheduled review process
 * behind these pages, so "reviewed quarterly" would be exactly the kind of
 * claim this component exists to remove. It states one date and who stands
 * behind it.
 */
export function PageReviewStamp({
  reviewedOn,
  verifyKey,
}: {
  /** The day a person last read the page through. Built from local date parts
   *  by the caller, so it never renders a day early west of Greenwich. */
  reviewedOn: Date;
  /** Full `ns:key` of this page's "check it yourself" line. */
  verifyKey: string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.stamp}>
      <p className={`${styles.row} ${styles.reviewed}`}>
        <FiCheckCircle aria-hidden />
        {t("marketing:reviewStamp.reviewed", { date: fmt.date(reviewedOn) })}
      </p>
      <p className={styles.row}>
        <FiAlertCircle aria-hidden />
        {t(verifyKey)}
      </p>
    </div>
  );
}
