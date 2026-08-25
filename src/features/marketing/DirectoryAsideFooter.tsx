import { useTranslation } from "../../shared/i18n/useTranslation";
import { ReportSubjectControl } from "../safety/ReportSubjectControl";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectoryContestControl } from "./DirectoryContestControl";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: the controls don't render (read-only view). */
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it.
   * Passed through to `DirectoryContestControl`, which hides itself for
   * owners (they use "Edit this listing" instead). */
  ownerRef?: string;
}

/**
 * The aside's trailing footer affordances. Two distinct paths, deliberately kept
 * separate:
 *
 * - "Report this listing" (`ReportSubjectControl`) — the generic safety report,
 *   open to ANYONE signed in or not, mirroring the housing/economy report
 *   triggers. Restored after the contest control below briefly subsumed it:
 *   a public queer-venue directory must let a logged-out visitor flag a
 *   harmful/miscategorised listing.
 * - "Suggest an edit or claim this listing" (`DirectoryContestControl`) — the
 *   member-only constructive/ownership paths (suggest an edit, ownership
 *   dispute with owner-notify, claim), which each require an account.
 *
 * Moderators previewing a listing see neither. Owners don't see the contest
 * control (they get "Edit this listing").
 */
export function DirectoryAsideFooter({ place, preview = false, ownerRef }: Props) {
  const { t } = useTranslation();
  // An owner sees neither control (the report is for other people's listings,
  // and the contest control hides itself for them), so the block that frames
  // them would otherwise render as an empty hairline under the last card.
  if (preview || ownerRef) return null;

  return (
    <div className={s.sideFooter}>
      <ReportSubjectControl
        subjectType="business"
        subjectId={place.slug}
        subjectName={place.name}
        label={t("marketing:directory.detail.reportCta")}
        ariaLabel={t("marketing:directory.detail.reportAriaLabel", {
          name: place.name,
        })}
      />
      {/* Member-only, and self-gated: renders nothing for a signed-out visitor,
          who still gets the report path above. */}
      <DirectoryContestControl place={place} ownerRef={ownerRef} />
    </div>
  );
}
