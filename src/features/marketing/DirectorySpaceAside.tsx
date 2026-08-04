import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  type DirectoryPlace,
  type Tint,
  websiteHref,
  websiteLabel,
} from "./directoryPlaces";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MEMBERS_HERE } from "./directorySpace.data";
import { BUSINESS_COORDS } from "./businessCoords";
import { LocationMiniMap } from "./LocationMiniMap";
import { DirectoryMapPlaceholder } from "./DirectoryMapPlaceholder";
import { DirectoryLanguages } from "./DirectoryLanguages";
import { DirectoryAccess } from "./DirectoryAccess";
import { DirectoryAsideFooter } from "./DirectoryAsideFooter";
import { DirectoryUpcoming } from "./DirectoryUpcoming";
import s from "./DirectorySpacePage.module.css";

const TINT: Record<Tint, string> = {
  coral: s.tCoral!,
  jade: s.tJade!,
  plum: s.tPlum!,
};

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: render contact/nav CTAs as inert (read-only view). */
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it.
   * Gates `DirectorySuggestEditControl` off for owners (they use "Edit this
   * listing" instead); never passed by the moderation preview. */
  ownerRef?: string;
}

export function DirectorySpaceAside({
  place,
  preview = false,
  ownerRef,
}: Props) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const igUrl = place.social.instagram
    ? `https://instagram.com/${place.social.instagram.replace(/^@/, "")}`
    : undefined;

  // Live listings carry their pin on the DTO; demo places have it hand-placed
  // in BUSINESS_COORDS by slug (same fallback order as localPlaces.ts). When
  // neither exists (location-less listings) we keep the decorative placeholder.
  const coords =
    place.latitude != null && place.longitude != null
      ? { latitude: place.latitude, longitude: place.longitude }
      : BUSINESS_COORDS[place.slug];

  // Some listings arrive with no real street address — often the venue name
  // repeated into the field. Show the address line only when it adds something
  // the bold name above it doesn't already say.
  const address = place.address?.trim();
  const showAddress =
    !!address && address.toLowerCase() !== place.name.trim().toLowerCase();

  return (
    <aside className={s.side}>
      <div className={s.sideCard}>
        <div className={s.map}>
          {coords ? (
            <LocationMiniMap
              latitude={coords.latitude}
              longitude={coords.longitude}
              ariaLabel={t("marketing:directory.detail.mapAria", {
                name: place.name,
              })}
            />
          ) : (
            <DirectoryMapPlaceholder />
          )}
        </div>
        <div className={s.addr}>
          <strong className={s.addrName}>{place.name}</strong>
          {showAddress && place.address}
        </div>
        {place.savedCount != null && place.savedCount > 0 && (
          <div className={s.savedSignal}>
            <FiHeart aria-hidden />
            {t("marketing:directory.detail.savedByMembers", {
              count: place.savedCount,
            })}
          </div>
        )}
        {place.social.phone && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 8.81 19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.16.93.4 1.83.7 2.7" />
            </svg>
            <a href={`tel:${place.social.phone.replace(/\s/g, "")}`}>
              {place.social.phone}
            </a>
          </div>
        )}
        {place.social.website && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <circle cx={12} cy={12} r={10} />
              <path d="M2 12h20M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20" />
            </svg>
            <a
              href={websiteHref(place.social.website)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {websiteLabel(place.social.website)}
            </a>
          </div>
        )}
        {igUrl && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <rect x={2} y={2} width={20} height={20} rx={5} />
              <circle cx={12} cy={12} r={4} />
              <line x1={17.5} y1={6.5} x2={17.5} y2={6.5} />
            </svg>
            <a href={igUrl} target="_blank" rel="noopener noreferrer">
              {place.social.instagram}
            </a>
          </div>
        )}
        {place.social.email && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <rect x={2} y={4} width={20} height={16} rx={2} />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <a href={`mailto:${place.social.email}`}>{place.social.email}</a>
          </div>
        )}
        <DirectoryLanguages langs={place.langs} />
        <DirectoryAccess place={place} />
        <div className={s.cta}>
          {place.social.website ? (
            <Button
              variant="primary"
              className={s.ctaBtn}
              href={websiteHref(place.social.website)}
            >
              {t("marketing:directory.detail.visitWebsite")}
            </Button>
          ) : place.social.email ? (
            <Button
              variant="primary"
              className={s.ctaBtn}
              href={`mailto:${place.social.email}`}
            >
              {t("marketing:directory.detail.getInTouch")}
            </Button>
          ) : null}
          {!preview && (
            <Button variant="ghost" className={s.ctaBtn} to={routes.directory}>
              {t("marketing:directory.detail.backToDirectory")}
            </Button>
          )}
        </div>
      </div>

      <div className={s.sideCard}>
        <h4>{t("marketing:directory.detail.whoRunsIt")}</h4>
        <div className={[s.ownerAv, TINT[place.owner.tint]].join(" ")}>
          {place.owner.initials}
        </div>
        <div className={s.ownerName}>{place.owner.name}</div>
        <div className={s.ownerRole}>{place.owner.role}</div>
        <span
          className={[
            s.qpChip,
            place.owner.inQueerPulse ? s.qpChipYes : s.qpChipNo,
          ].join(" ")}
        >
          {t(
            place.owner.inQueerPulse
              ? "marketing:directory.detail.onQueerPulse"
              : "marketing:directory.detail.communityVouched",
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
            })}
          </Button>
        )}
        {/* Non-owners who actually run this place get a way in: the list-a-
            business wizard's existing "claim" path. Hidden for the owner (they
            already have "Edit this listing") and in the read-only preview. */}
        {!ownerRef && !preview && (
          <Link to={routes.listBusiness} className={s.claimLink}>
            {t("marketing:directory.detail.claimCta")}
          </Link>
        )}
      </div>

      {/* "Members here lately" is a fabricated demo roster (directorySpace.data)
          with no per-place backing from the API — show it only in demo so real
          business pages never display invented visitors. */}
      {demoMode && (
        <div className={s.sideCard}>
          <h4>{t("marketing:directory.detail.membersHereLately")}</h4>
          <div className={s.whoHere}>
            {MEMBERS_HERE.map((member) => (
              <div key={member.initials} className={s.whoRow}>
                <span className={[s.whoAv, TINT[member.tint]].join(" ")}>
                  {member.initials}
                </span>
                <Link to={routes.members}>{member.name}</Link>
                <span className={s.whoWhen}>{t(member.whenKey)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {place.upcoming && place.upcoming.length > 0 && (
        <div className={s.sideCard}>
          <h4>{t("marketing:directory.detail.upcomingHere")}</h4>
          <DirectoryUpcoming
            upcoming={place.upcoming}
            placeName={place.name}
            preview={preview}
          />
        </div>
      )}

      <DirectoryAsideFooter place={place} preview={preview} ownerRef={ownerRef} />
    </aside>
  );
}
