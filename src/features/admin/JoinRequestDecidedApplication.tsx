import { useId } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import { JoinRequestFacts } from "./JoinRequestFacts";
import queueStyles from "./AdminMembersPage.module.css";
import styles from "./AdminVerifyDecided.module.css";

/**
 * What the applicant sent, kept in a decided row so a reviewer can re-read it
 * after the call: the same facts, message and 18+ record the pending card
 * shows. The email row is left out because the row's summary already shows
 * it right above.
 *
 * A labelled group carries the label. The Decided tab has no heading of its
 * own under the page title, and a heading repeated in every open row with no
 * applicant name in it would crowd the outline; the staff note label in the
 * same row is a plain label too.
 */
export function JoinRequestDecidedApplication({
  item,
}: {
  item: JoinRequestView;
}) {
  const { t } = useTranslation();
  const labelId = `${useId()}-application`;
  return (
    <div role="group" aria-labelledby={labelId} className={styles.application}>
      <p id={labelId} className={styles.applicationLabel}>
        {t("admin:members.verify.decided.applicationHeading")}
      </p>
      <JoinRequestFacts item={item} shouldShowEmail={false} />
      <p className={queueStyles.queueMsg}>“{item.message}”</p>
      <div className={queueStyles.queueAttest}>
        <FiCheckCircle aria-hidden />
        {item.ageLine}
      </div>
    </div>
  );
}
