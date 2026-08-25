import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { type DirectoryPlace } from "./directoryPlaces";
import { routes } from "../../app/routeMap";
import { DirectoryClaimModal } from "./DirectoryClaimModal";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  preview: boolean;
  /** Present only when the viewer owns this listing — hides the claim link
   * (they already have "Edit this listing" elsewhere on the page). */
  ownerRef?: string;
}

/** "Who runs it" card: the owner's avatar/name/role, whether they're on
 * QueerPulse, and — for non-owners viewing a live page — a way to claim the
 * listing if they're the ones who actually run it. */
export function DirectoryAsideOwner({ place, preview, ownerRef }: Props) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [claiming, setClaiming] = useState(false);
  // A live claim must be addressable by the listing's `ref`; demo never hits
  // the network. A synthetic demo-only entry with no ref falls back to the
  // create wizard, same as DirectoryContestControl's identical gate.
  const listingRef = place.ref ?? undefined;
  const canFileAgainstListing = demoMode || Boolean(listingRef);

  return (
    <div className={s.sideCard}>
      <h4>{t("marketing:directory.detail.whoRunsIt")}</h4>
      <Avatar
        className={s.ownerAv}
        size={52}
        initials={place.owner.initials}
        tint={place.owner.tint}
        src={place.owner.avatarUrl ?? undefined}
      />
      <div className={s.ownerName}>{place.owner.name}</div>
      <div className={s.ownerRole}>{place.owner.role}</div>
      {/* The person who runs this place either has a QueerPulse account or
          does not. The second case is not an endorsement: nobody vouched for
          anything, a member simply put the listing here. The chip says that
          and nothing more, so the platform's real vouching system keeps the
          only claim to the word. */}
      <span
        className={[
          s.qpChip,
          place.owner.inQueerPulse ? s.qpChipYes : s.qpChipNo,
        ].join(" ")}
      >
        {t(
          place.owner.inQueerPulse
            ? "marketing:directory.detail.onQueerPulse"
            : "marketing:directory.detail.addedByMember",
        )}
      </span>
      <p className={s.ownerBio}>{place.owner.bio}</p>
      {place.owner.inQueerPulse && (
        <Button
          variant="ghost"
          className={s.ctaBtn}
          to={
            place.owner.slug
              ? `${routes.members}/${place.owner.slug}`
              : routes.members
          }
        >
          {t("marketing:directory.detail.viewProfile", {
            name: place.owner.first,
          })}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      )}
      {/* Non-owners who actually run this place get a way in: a real
          ownership claim reviewed by a moderator (falls back to the list-a-
          business wizard only when there's no real listing to claim against).
          Hidden for the owner (they already have "Edit this listing") and in
          the read-only preview. */}
      {!ownerRef &&
        !preview &&
        (canFileAgainstListing ? (
          <button
            type="button"
            className={s.claimLink}
            onClick={() => setClaiming(true)}
          >
            {t("marketing:directory.detail.claimCta")}{" "}
            <FiArrowRight aria-hidden />
          </button>
        ) : (
          <Link to={routes.listBusiness} className={s.claimLink}>
            {t("marketing:directory.detail.claimCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        ))}
      {claiming && (
        <DirectoryClaimModal
          listingRef={listingRef ?? place.slug}
          placeName={place.name}
          onClose={() => setClaiming(false)}
        />
      )}
    </div>
  );
}
