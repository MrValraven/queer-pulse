import {
  FiAtSign,
  FiCompass,
  FiExternalLink,
  FiMail,
  FiMapPin,
  FiRadio,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import styles from "./AdminMembersPage.module.css";
import { encodedHostOf } from "./socialProfileLink";

/**
 * The applicant facts a reviewer reads to make the call: how to reach them,
 * where they are, how they found us, the social profile they shared, and
 * whoever already vouches for them.
 *
 * Extracted from `JoinRequestCard` so that card stays under the repo's
 * 200-line component limit. Same `<dl>`, same rows, same order, same
 * conditions on the optional rows (heard from, social profile, mutual member
 * and reference).
 */
export function JoinRequestFacts({
  item,
  shouldShowEmail = true,
}: {
  item: JoinRequestView;
  /** False where the email is already on screen, as in a decided row's
   *  summary. Defaults to true, so the pending card is unchanged. */
  shouldShowEmail?: boolean;
}) {
  const { t } = useTranslation();
  const encodedHost = encodedHostOf(item.socialProfileHref);
  return (
    <dl className={styles.queueFacts}>
      {shouldShowEmail && (
        <div className={styles.queueFact}>
          <dt className={styles.queueFactLabel}>
            <FiMail aria-hidden />
            {t("admin:members.verify.emailLabel")}
          </dt>
          <dd className={styles.queueFactValue}>
            <a href={`mailto:${item.email}`}>{item.email}</a>
          </dd>
        </div>
      )}
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
      {item.heardFrom !== null && (
        <div className={styles.queueFact}>
          <dt className={styles.queueFactLabel}>
            <FiRadio aria-hidden />
            {t("admin:members.verify.heardFromLabel")}
          </dt>
          <dd className={styles.queueFactValue}>{item.heardFrom}</dd>
        </div>
      )}
      {item.socialProfile !== null && (
        <div className={styles.queueFact}>
          <dt className={styles.queueFactLabel}>
            <FiAtSign aria-hidden />
            {t("admin:members.verify.socialProfileLabel")}
          </dt>
          <dd className={styles.queueFactValue}>
            {item.socialProfileHref ? (
              // Applicant-typed URL: opens in a new tab that cannot reach this
              // window, sends no referrer (the admin URL stays private) and
              // passes on no endorsement.
              <a
                href={item.socialProfileHref}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                {item.socialProfile}
                <span className={styles.queueFactLinkTail}>
                  {"\u2060"}
                  <FiExternalLink
                    aria-hidden
                    className={styles.queueFactLinkIcon}
                  />
                </span>
                <span className="visuallyHidden">
                  {t("admin:members.verify.opensInNewTab")}
                </span>
              </a>
            ) : (
              item.socialProfile
            )}
            {encodedHost !== null && (
              <span className={styles.queueFactNote}>
                <Translation
                  i18nKey="admin:members.verify.socialProfileGoesTo"
                  slots={{
                    host: (
                      <span className={styles.queueFactNoteHost}>
                        {encodedHost}
                      </span>
                    ),
                  }}
                />
              </span>
            )}
          </dd>
        </div>
      )}
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
