import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
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
 * The aside's trailing footer affordances. Three distinct paths, deliberately
 * kept separate:
 *
 * - "Report this listing" (`ReportSubjectControl`) — the generic safety report,
 *   open to ANYONE signed in or not, mirroring the housing/economy report
 *   triggers. Restored after the contest control below briefly subsumed it:
 *   a public queer-venue directory must let a logged-out visitor flag a
 *   harmful/miscategorised listing.
 * - "Suggest an edit or claim this listing" (`DirectoryContestControl`) — the
 *   member-only constructive/ownership paths (suggest an edit, ownership
 *   dispute with owner-notify, claim), which each require an account.
 * - "See the claims you've filed" (a plain link) is the way back to a claim
 *   already filed, moved here when the owner card above it was demoted to a
 *   header byline. Live only.
 *
 * Moderators previewing a listing see none of them. Owners don't see the
 * contest control (they get "Edit this listing").
 */
export function DirectoryAsideFooter({
  place,
  preview = false,
  ownerRef,
}: Props) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // An owner sees neither control (the report is for other people's listings,
  // and the contest control hides itself for them), so the block that frames
  // them would otherwise render as an empty hairline under the last card.
  if (preview || ownerRef) return null;

  return (
    <div className={s.sideFooter}>
      {/* `isUnclaimed` is the backend's `ownerId === null`, and TWO distinct
          situations produce it. One: QueerPulse staff authored the entry for
          a business that has not joined. Two: a member created the listing
          and later erased their account, which nulls the column via
          `ON DELETE SET NULL` and leaves the venue live and unowned (see
          `ContentOwnerErasureService`). The copy therefore states the claim
          status alone and stays silent on who wrote the entry, because in
          the second situation a member did and saying otherwise would be a
          false public claim about a real business.

          The narrower house-authored predicate is
          `ownerId IS NULL AND createdByStaffId IS NOT NULL`
          (`listing.entity.ts`). `createdByStaffId` is deliberately absent
          from every public DTO: which staff account wrote a listing is
          nothing a visitor should be told, so this line stays general.

          A blank `owner.name` is the wrong signal here whichever situation
          applies: an owner who chose anonymity has one too, and inviting
          them to claim their own listing would out them. */}
      {place.isUnclaimed && (
        <p className={s.footerUnclaimedNote}>
          {t("marketing:directory.detail.unclaimedNote")}
        </p>
      )}
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
          who still gets the report path above. The "Claim this listing" link
          the owner card used to carry is deliberately gone: this control opens
          the same `DirectoryClaimModal`, so restoring it would be a duplicate
          entry to one flow. */}
      <DirectoryContestControl place={place} ownerRef={ownerRef} />
      {/* The way back to a claim already filed, for a non-owner looking at the
          listing again. Live only: a demo persona's claim never leaves the
          browser, so there is nothing server-side to track. */}
      {!demoMode && (
        <Link to={routes.listingClaims} className={s.footerClaimsLink}>
          {t("marketing:directory.detail.claimsFiledLink")}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      )}
    </div>
  );
}
