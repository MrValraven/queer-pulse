import {
  FiCompass,
  FiMail,
  FiMapPin,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import styles from "./AdminMembersPage.module.css";

/**
 * The applicant facts a reviewer reads to make the call: how to reach them,
 * where they are, how they found us, and whoever already vouches for them.
 *
 * Extracted from `JoinRequestCard` so that card stays under the repo's
 * 200-line component limit. Same `<dl>`, same rows, same order, same
 * conditions on the two optional rows.
 */
export function JoinRequestFacts({ item }: { item: JoinRequestView }) {
  const { t } = useTranslation();
  return (
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
      {item.mutualMemberEmail && (
        <div className={styles.queueFact}>
          <dt className={styles.queueFactLabel}>
            <FiUserCheck aria-hidden />
            {t("admin:members.verify.mutualLabel")}
          </dt>
          <dd className={styles.queueFactValue}>
            <a href={`mailto:${item.mutualMemberEmail}`}>
              {item.mutualMemberEmail}
            </a>
          </dd>
        </div>
      )}
      {item.referenceLine && (
        <div className={styles.queueFact}>
          <dt className={styles.queueFactLabel}>
            <FiUsers aria-hidden />
            {t("admin:members.verify.referenceLabel")}
          </dt>
          <dd className={styles.queueFactValue}>
            {item.referenceMemberSlug ? (
              <Link to={`/members/${item.referenceMemberSlug}`}>
                {item.referenceLine}
              </Link>
            ) : (
              item.referenceLine
            )}
          </dd>
        </div>
      )}
    </dl>
  );
}
