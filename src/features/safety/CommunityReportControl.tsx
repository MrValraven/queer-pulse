import { useState } from "react";
import { FiFlag } from "react-icons/fi";
import { useAuth } from "../../app/providers/authContext";
import { IconButton, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CommunityReportModal } from "./CommunityReportModal";

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
 * Icon-only, with its name in a tooltip. Reporting is a rare, deliberate act,
 * and spelling it out in the hero put a fifth line of text beside Join / Save
 * / Share for something almost nobody clicks. The flag alone keeps it findable
 * without competing; `IconButton` carries the 44px tap target and the
 * mandatory accessible name, so nothing is lost to a screen reader.
 *
 * It lives in `features/safety` rather than `features/communities` so the
 * whole report path (trigger, modal, taxonomy, API call) stays in one place.
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
      <Tooltip label={t("safety:report.community.trigger")}>
        <IconButton
          tone="dark"
          onClick={() => setIsReporting(true)}
          aria-label={t("safety:report.community.triggerAria", {
            name: communityName,
          })}
        >
          <FiFlag aria-hidden />
        </IconButton>
      </Tooltip>

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
