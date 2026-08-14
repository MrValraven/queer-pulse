import { FiCheckCircle, FiCompass, FiMail, FiMapPin } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import styles from "./AdminMembersPage.module.css";

/**
 * One pending applicant in the mod review queue: everything a reviewer needs to
 * make the call — their name, the email we'd reach them on, their city, their
 * own words, and the 18+ attestation record — plus the two decisions.
 */
export function JoinRequestCard({
  item,
  leaving,
  onDecision,
}: {
  item: JoinRequestView;
  leaving: boolean;
  onDecision: (status: "approved" | "declined") => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={`${styles.queueCard} ${leaving ? styles.queueCardLeaving : ""}`}
    >
      <div className={styles.queueHead}>
        <AdminAvatar
          initials={item.initials}
          tone={item.tone}
          size="md"
          src={portrait(item.name)}
        />
        <div>
          <div className={styles.queueName}>{item.name}</div>
          <div className={styles.queueApplied}>{item.appliedLine}</div>
        </div>
      </div>

      <dl className={styles.queueFacts}>
        <div className={styles.queueFact}>
          <dt className={styles.queueFactLabel}>
            <FiMail aria-hidden />
            {t("admin:members.verify.emailLabel")}
          </dt>
          <dd className={styles.queueFactValue}>
            <a href={`mailto:${item.email}`}>{item.email}</a>
          </dd>
        </div>
        <div className={styles.queueFact}>
          <dt className={styles.queueFactLabel}>
            <FiMapPin aria-hidden />
            {t("admin:members.verify.cityLabel")}
          </dt>
          <dd className={styles.queueFactValue}>
            {item.city ?? t("admin:members.verify.noCity")}
          </dd>
        </div>
        <div className={styles.queueFact}>
          <dt className={styles.queueFactLabel}>
            <FiCompass aria-hidden />
            {t("admin:members.verify.sourceLabel")}
          </dt>
          <dd className={styles.queueFactValue}>{item.sourceLabel}</dd>
        </div>
      </dl>

      <p className={styles.queueMsg}>“{item.message}”</p>

      <div className={styles.queueAttest}>
        <FiCheckCircle aria-hidden />
        {item.ageLine}
      </div>

      <div className={styles.queueActions}>
        <Button
          variant="ghost"
          size="md"
          onClick={() => onDecision("declined")}
        >
          {t("admin:members.verify.declineCta")}
        </Button>
        <Button variant="jade" size="md" onClick={() => onDecision("approved")}>
          {t("admin:members.verify.approveCta")}
        </Button>
      </div>
    </div>
  );
}
