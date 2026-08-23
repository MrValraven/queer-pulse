import { Link } from "react-router-dom";
import { FiCalendar, FiGrid, FiUsers } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { ModRequest } from "./community.model";
import { photoOf } from "./communityPeople";
import { involvementLabelKey } from "./joinModal.data";
import { useCommunityTime } from "./communityTime";
import styles from "./ModJoinRequestRow.module.css";

const MONTH_AND_YEAR: Intl.DateTimeFormatOptions = {
  month: "long",
  year: "numeric",
};

/**
 * Who a moderator is being asked to let in.
 *
 * The row used to be an avatar, a name in plain text, the note and "requested
 * 3h ago", which is not enough to decide with and not even enough to go look
 * the person up. It now links to their profile and shows the context the
 * backend computes: pronouns, how long they have been on the platform, and how
 * much of the community's own world they already share.
 *
 * PRODUCT CONSTRAINT, deliberately load-bearing: these are CONTEXT, never a
 * score, a rank or a recommendation. There is no total, no ordering, no
 * badge for a "strong" applicant and nothing that reads as vetting who
 * someone is. A new account with nothing in common is a normal person asking
 * to join, and the surface must let a moderator read it that way.
 */
export function JoinRequestApplicantCard({ request }: { request: ModRequest }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const communityTime = useCommunityTime();
  const applicant = request.person;
  const labelKey = involvementLabelKey(request.involvement);

  return (
    <div className={styles.applicant}>
      <Avatar
        initials={applicant.initials}
        tint={applicant.tint}
        src={photoOf(applicant, demoMode)}
        size={46}
        // The name is right beside this as visible text, so the image is
        // decorative (axe image-redundant-alt).
      />
      <div className={styles.main}>
        <div className={styles.nameRow}>
          {applicant.slug ? (
            <Link to={`/members/${applicant.slug}`} className={styles.nameLink}>
              {applicant.name}
            </Link>
          ) : (
            <span className={styles.name}>{applicant.name}</span>
          )}
          {request.pronouns && (
            <span className={styles.pronouns}>{request.pronouns}</span>
          )}
          <MemberStaffBadge slug={applicant.slug} />
        </div>

        <div className={styles.signals}>
          {request.accountCreatedAt && (
            <span className={styles.signal}>
              <FiCalendar aria-hidden />
              {t("communities:detail.modtools.joinRequests.applicant.since", {
                date: fmt.date(
                  new Date(request.accountCreatedAt),
                  MONTH_AND_YEAR,
                ),
              })}
            </span>
          )}
          {request.sharedConnectionCount != null && (
            <span className={styles.signal}>
              <FiUsers aria-hidden />
              {t(
                "communities:detail.modtools.joinRequests.applicant.sharedConnections",
                { count: request.sharedConnectionCount },
              )}
            </span>
          )}
          {request.sharedCommunityCount != null && (
            <span className={styles.signal}>
              <FiGrid aria-hidden />
              {t(
                "communities:detail.modtools.joinRequests.applicant.sharedCommunities",
                { count: request.sharedCommunityCount },
              )}
            </span>
          )}
        </div>

        {labelKey && (
          <div className={styles.line}>
            <span className={styles.lineLabel}>
              {t(
                "communities:detail.modtools.joinRequests.applicant.involvementLabel",
              )}
            </span>{" "}
            {t(labelKey)}
          </div>
        )}

        {request.note && (
          <div className={styles.line}>
            <span className={styles.lineLabel}>
              {t(
                "communities:detail.modtools.joinRequests.applicant.noteLabel",
              )}
            </span>
            <p className={styles.note}>{request.note}</p>
          </div>
        )}

        <div className={styles.requested}>
          {t("communities:detail.modtools.joinRequests.requestedAgo", {
            time: communityTime.ago(request),
          })}
        </div>
      </div>
    </div>
  );
}
