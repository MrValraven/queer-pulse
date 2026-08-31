import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { ImageSlot, Reveal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileSubprofiles } from "../subprofiles/api/usePublicSubprofile";
import { useSubprofiles } from "../subprofiles/api/useSubprofiles";
import type { Member } from "./data/members";
import { useMemberListings } from "./api/useMemberListings";
import { ProfileNetworkStats } from "./ProfileNetworkStats";
import { ProfilePhotoViewer } from "./ProfilePhotoViewer";
import { ProfileTrustSignals } from "./ProfileTrustSignals";
import { PROFILE_SECTION_NAV_ITEMS } from "./profileSectionNav.data";
import { useSectionScrollSpy } from "./useSectionScrollSpy";
import styles from "./ProfileRail.module.css";

interface ProfileRailProps {
  profile: Member;
  /** Whether this is the viewer's own profile (resolved by the page against
   *  the authenticated user, same prop `ProfileHero` receives). */
  self?: boolean;
  /** When true, render your own profile exactly as a visitor would see it. */
  asVisitor?: boolean;
}

/**
 * The profile hero's left column: portrait, location/member-since meta,
 * trust signals, the owner's private network stats, and a desktop
 * section-jump nav. Composes `ProfileTrustSignals`/`ProfileNetworkStats`.
 * The owner-only settings (who sees what / hide me / your data) live in
 * `ProfileSettingsMenu`, in the hero's `ctaRow` (`ProfileHeroMain.tsx`) —
 * they moved out of an always-visible rail card into a top-of-profile kebab
 * menu, mirroring the visitor-facing `ProfileSafetyMenu` in the same row.
 *
 * The location line is gated two ways. The backend already nulls `location`
 * for a non-owner when `hoodVisible` is off (or the profile is
 * network/private), which the adapter maps to `hood: ""`; rendering that
 * unconditionally printed a pin followed by a bare ", Lisbon" on every hidden
 * profile, so an empty `hood` now renders nothing at all. And in "preview as
 * visitor" the owner's own `hood` IS present, so `hoodVisible` is honoured
 * directly there: the preview has to agree with the toggle in Who sees what.
 */
export function ProfileRail({
  profile,
  self = false,
  asVisitor = false,
}: ProfileRailProps) {
  const { t } = useTranslation();
  const realSelf = self && !asVisitor;
  const fullName = `${profile.first} ${profile.last}`;
  const portraitTint = profile.tint === "auth" ? "plum" : profile.tint;
  const [photoOpen, setPhotoOpen] = useState(false);
  // See the docblock: an empty `hood` means the viewer isn't entitled to it (or
  // the member never set one), and the visitor preview additionally honours the
  // owner's own `hoodVisible` toggle.
  const isLocationShown =
    profile.hood.trim().length > 0 &&
    (realSelf || profile.hoodVisible !== false);

  const portrait = (
    <ImageSlot
      tint={portraitTint}
      src={profile.photo}
      initials={profile.initials}
      height={430}
      srcSize={900}
      radius={20}
      placeholder={fullName}
      alt={fullName}
    />
  );

  return (
    <aside
      className={styles.rail}
      aria-label={t("members:profile.railLabel", { name: profile.first })}
    >
      <Reveal className={styles.portraitWrap}>
        {profile.photo ? (
          <button
            type="button"
            className={styles.portraitButton}
            onClick={() => setPhotoOpen(true)}
            aria-label={t("members:profile.hero.viewPhotoAria", {
              name: fullName,
            })}
          >
            {portrait}
          </button>
        ) : (
          portrait
        )}
        {profile.verified && (
          <span className={styles.vbadgeLg}>
            <FiCheckCircle aria-hidden />
            {t("members:profile.hero.verifiedBadge")}
          </span>
        )}
      </Reveal>

      {(isLocationShown || profile.since) && (
        <div className={styles.meta}>
          {isLocationShown && (
            <span className={styles.loc}>
              <span className={styles.pin} aria-hidden />
              {t("members:profile.hero.location", { hood: profile.hood })}
            </span>
          )}
          {profile.since && (
            <span className={styles.muted}>
              {t("members:profile.hero.memberSince", { since: profile.since })}
            </span>
          )}
        </div>
      )}

      {/* A real self's own network numbers (below) already include their
          vouch count, so showing both here would repeat the same fact twice
          in two different styles — a visitor only ever sees the vouch line. */}
      {realSelf ? (
        <ProfileNetworkStats ownerSlug={profile.slug} />
      ) : (
        <ProfileTrustSignals profile={profile} />
      )}

      {photoOpen && profile.photo && (
        <ProfilePhotoViewer
          src={profile.photo}
          name={fullName}
          tint={portraitTint}
          onClose={() => setPhotoOpen(false)}
        />
      )}
    </aside>
  );
}

/**
 * The section-jump nav alone, in its own rail column — used beside the
 * below-hero content sections (`ProfilePage.tsx`'s second `.pageGrid`). Split
 * out from {@link ProfileRail} so the "Also working as" section between the
 * two grids can run full-width: the portrait/meta/trust block stays paired
 * with the hero above it, while the sticky nav resumes here, alongside the
 * sections it actually links to.
 */
export function ProfileSectionNavRail({
  profile,
  self = false,
  asVisitor = false,
}: ProfileRailProps) {
  const realSelf = self && !asVisitor;
  return (
    <div className={styles.rail}>
      <ProfileSectionNav profile={profile} isSelf={realSelf} />
    </div>
  );
}

/**
 * Desktop-only section-jump nav: anchor links to each below-hero section,
 * filtered to the ones this profile actually renders, with a scroll-spy
 * highlight on the section nearest the top of the viewport. Hidden below the
 * `--mobile` breakpoint (see `.snav` in `ProfileRail.module.css`) — mobile
 * has no equivalent jump list today.
 */
function ProfileSectionNav({
  profile,
  isSelf,
}: {
  profile: Member;
  isSelf: boolean;
}) {
  const { t } = useTranslation();

  // "also-working-as" and "places" aren't fields on `Member`, so their
  // visibility can't come from a static predicate over `profile` like every
  // other nav item — resolve them here via the same hooks/logic their
  // section bodies use (ProfileSubprofilesSection, PlacesSection), so the
  // nav link never points at a section that doesn't actually render.
  const subprofilesOwnerQuery = useSubprofiles({ enabled: isSelf });
  const subprofilesPublicQuery = useProfileSubprofiles(profile.slug);
  const subprofilesLoading = isSelf
    ? subprofilesOwnerQuery.isLoading
    : subprofilesPublicQuery.isLoading;
  const hasSubprofiles = isSelf
    ? (subprofilesOwnerQuery.data?.length ?? 0) > 0
    : (subprofilesPublicQuery.data?.length ?? 0) > 0;
  // Mirrors ProfileSubprofilesSection: hidden while loading; the owner
  // always gets a section (personas or the empty-state prompt), a visitor
  // only when there's at least one persona to show.
  const showAlsoWorkingAs = !subprofilesLoading && (isSelf || hasSubprofiles);

  const visitorListings = useMemberListings(profile.slug);
  // Mirrors PlacesSection: the owner always gets a section (places or the
  // empty-state prompt), a visitor when there's at least one place or when the
  // fetch failed — PlacesSection then renders its retryable error panel, and
  // the nav link has to point at a section that really is on the page.
  const showPlaces =
    isSelf || visitorListings.places.length > 0 || visitorListings.isError;

  const dynamicVisibility: Record<string, boolean> = {
    "also-working-as": showAlsoWorkingAs,
    places: showPlaces,
  };

  const visibleItems = PROFILE_SECTION_NAV_ITEMS.filter((item) =>
    item.id in dynamicVisibility
      ? dynamicVisibility[item.id]
      : item.isVisible(profile),
  );
  const sectionIds = visibleItems.map((item) => item.id);
  const activeSectionId = useSectionScrollSpy(sectionIds);

  if (visibleItems.length === 0) return null;

  return (
    <nav className={styles.snav} aria-label={t("members:profile.nav.label")}>
      <span className={styles.snavTitle}>{t("members:profile.nav.title")}</span>
      {visibleItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={
            item.id === activeSectionId
              ? `${styles.snavLink} ${styles.on}`
              : styles.snavLink
          }
          aria-current={item.id === activeSectionId ? "location" : undefined}
        >
          {t(item.labelKey)}
        </a>
      ))}
    </nav>
  );
}
