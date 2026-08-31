import { useState } from "react";
import { FiFlag } from "react-icons/fi";
import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CommunityReportModal } from "./CommunityReportModal";
import styles from "./CommunityReportControl.module.css";

/**
 * The "Report this community" entry point in the community detail hero.
 *
 * Deliberately signed-in only, unlike `ReportSubjectControl`: a community
 * report names a whole space and its organisers, and the backend de-dupes on
 * `(reporter, subject)`, so an unauthenticated one carries neither a reporter
 * to de-dupe against nor anyone a moderator can come back to. Membership is
 * NOT required, which is the point: somebody looking in from outside a public
 * community is often the person who can see what it is organised around.
 *
 * It lives in `features/safety` rather than `features/communities` so the
 * whole report path (trigger, modal, taxonomy, API call) stays in one place,
 * and so its styles do not have to be threaded through the communities CSS
 * module.
 */
export function CommunityReportControl({
  slug,
  communityName,
}: {
  /** The community's slug, which IS the report's `subjectId` for this subject. */
  slug: string;
  communityName: string;
}) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const [isReporting, setIsReporting] = useState(false);

  if (!loggedIn) return null;

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsReporting(true)}
        aria-label={t("safety:report.community.triggerAria", {
          name: communityName,
        })}
      >
        <FiFlag aria-hidden />
        {t("safety:report.community.trigger")}
      </button>

      {isReporting && (
        <CommunityReportModal
          slug={slug}
          communityName={communityName}
          onClose={() => setIsReporting(false)}
        />
      )}
    </>
  );
}
