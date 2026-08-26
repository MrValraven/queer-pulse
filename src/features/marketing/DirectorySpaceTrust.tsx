import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type DirectoryPlace } from "./directoryPlaces";
import {
  directoryTrustToAsideData,
  directoryVouchesToSafetyVouches,
} from "./api/directorySafeSpace.adapters";
import { SafeSpaceTrustBanner } from "../safety/SafeSpaceTrustBanner";
import { SafeSpacePromisesList } from "../safety/SafeSpacePromisesList";
import { SafeSpaceVouchesList } from "../safety/SafeSpaceVouchesList";
import { SafeSpaceVerifiedAside } from "../safety/SafeSpaceVerifiedAside";
import { VouchModal } from "../safety/VouchModal";
import safetyStyles from "../safety/SafeSpaceDetailPage.module.css";
import s from "./DirectorySpacePage.module.css";

/**
 * The safe-space trust section, rendered inline within the directory detail
 * page for a verified listing: the trust-tier banner, the promises list, the
 * vouches list, and the verified aside. Reuses the safety feature's detail
 * presentational blocks — the same components the /safe-spaces hub's own
 * detail page renders — rather than duplicating the trust UI, bridging the
 * directory detail's RAW `safeSpace*` fields onto the shapes those components
 * expect via `directorySafeSpace.adapters`.
 *
 * Mounted by `DirectorySpaceView` INSIDE its own existing `.page` container
 * (not wrapped in a second page-level container of its own) — this only
 * needs `.trustSection` for a section-level divider, plus the safety
 * feature's own `.grid` for its internal two-column (main + aside) layout,
 * the same one `SafeSpaceDetailPage`'s `VerifiedView` uses for the identical
 * arrangement.
 *
 * Two different gates, and keeping them apart is the point:
 *
 * - The BANNER always renders. It is `SafeSpaceBadgeStatus`, which reads the
 *   live per-slug state and shows nothing at all for a place with no badge, so
 *   a space still collecting its three visits gets to say "under review" and a
 *   suspended badge gets to say it is on hold. Gating that on
 *   `safeSpaceStatus === "verified"` would leave the last-known verified
 *   narrative on screen with nothing to qualify it.
 * - The STATIC narrative below it (promises, vouches, the aside) renders only
 *   for a listing that carries a badge at all: `"verified"` or `"suspended"`.
 *   A suspended badge is a real grant on hold, so the promises the place made
 *   and the vouches members wrote are still a true record and stay, under a
 *   banner that has already said the badge is not currently speaking. A
 *   never-reviewed listing used to print empty "What you can rely on here" and
 *   "Where" headings with nothing under them.
 */
export function DirectorySpaceTrust({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const [vouchOpen, setVouchOpen] = useState(false);

  // "Is there a badge at all", never "is it verified": a suspended badge is a
  // real grant on hold, and dropping its record would leave a member who saw it
  // yesterday with no explanation.
  const hasBadgeRecord =
    place.safeSpaceStatus === "verified" ||
    place.safeSpaceStatus === "suspended";

  const vouches = directoryVouchesToSafetyVouches(place.safeSpaceVouches ?? []);
  const asideData = directoryTrustToAsideData({
    name: place.name,
    address: place.address,
    reVerifiedAt: place.safeSpaceReVerifiedAt ?? null,
    lastVerifiedLabel: t("marketing:directory.detail.trust.lastVerifiedLabel"),
  });

  return (
    <div className={s.trustSection}>
      <SafeSpaceTrustBanner
        slug={place.slug}
        spaceName={place.name}
        tier={place.safeSpaceTier ?? 0}
        reVerified={place.safeSpaceReVerifiedAt ?? ""}
        verifier={place.safeSpaceVerifier ?? ""}
      />

      {hasBadgeRecord && (
        <div className={safetyStyles.grid}>
          <div>
            <SafeSpacePromisesList promises={place.safeSpacePromises ?? []} />
            <SafeSpaceVouchesList
              vouches={vouches}
              onAddVouch={() => setVouchOpen(true)}
            />
          </div>

          <SafeSpaceVerifiedAside space={asideData} showBackLink={false} />
        </div>
      )}

      <p className={s.trustHowLine}>
        {t("marketing:directory.detail.trust.howLine")}{" "}
        <Link className={s.trustHowLink} to={routes.safeSpaces}>
          {t("marketing:directory.detail.trust.howLink")}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      </p>

      {vouchOpen && (
        <VouchModal
          spaceSlug={place.slug}
          spaceName={place.name}
          onClose={() => setVouchOpen(false)}
        />
      )}
    </div>
  );
}
