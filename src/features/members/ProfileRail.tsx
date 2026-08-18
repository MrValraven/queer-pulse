import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { ImageSlot, Reveal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Member } from "./data/members";
import { ProfileNetworkStats } from "./ProfileNetworkStats";
import { ProfilePhotoViewer } from "./ProfilePhotoViewer";
import { ProfileRailControls } from "./ProfileRailControls";
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
  onOpenWhoSeesWhat: () => void;
  onOpenAccountData: () => void;
  onToggleHidden: () => void;
  hiddenUntil: string | null;
}

/**
 * The profile hero's left column: portrait, location/member-since meta,
 * trust signals, the owner's private network chips, owner-only rail
 * controls, and a desktop section-jump nav. Composes `ProfileTrustSignals`
 * (Task 4), `ProfileRailControls` (Task 5) and the existing
 * `ProfileNetworkStats`. Not yet wired into `ProfileHero` — that lands with
 * Task 6, which decomposes `ProfileHero` into `ProfileRail` + `ProfileHeroMain`.
 *
 * `photoVisible`/`hoodVisible` (backend Task 7) haven't reached the FE
 * `Member` type/mapper yet, so the portrait and location render ungated here,
 * exactly like the current `ProfileHero` does today — see the task report's
 * concerns section.
 */
export function ProfileRail({
  profile,
  self = false,
  asVisitor = false,
  onOpenWhoSeesWhat,
  onOpenAccountData,
  onToggleHidden,
  hiddenUntil,
}: ProfileRailProps) {
  const { t } = useTranslation();
  const realSelf = self && !asVisitor;
  const fullName = `${profile.first} ${profile.last}`;
  const portraitTint = profile.tint === "auth" ? "plum" : profile.tint;
  const [photoOpen, setPhotoOpen] = useState(false);

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

      <div className={styles.meta}>
        <span className={styles.loc}>
          <span className={styles.pin} aria-hidden />
          {t("members:profile.hero.location", { hood: profile.hood })}
        </span>
        {profile.since && (
          <span className={styles.muted}>
            {t("members:profile.hero.memberSince", { since: profile.since })}
          </span>
        )}
      </div>

      <ProfileTrustSignals profile={profile} />

      {realSelf && <ProfileNetworkStats ownerSlug={profile.slug} />}

      {realSelf && (
        <ProfileRailControls
          onOpenWhoSeesWhat={onOpenWhoSeesWhat}
          onOpenAccountData={onOpenAccountData}
          onToggleHidden={onToggleHidden}
          hiddenUntil={hiddenUntil}
        />
      )}

      <ProfileSectionNav profile={profile} />

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
 * Desktop-only section-jump nav: anchor links to each below-hero section,
 * filtered to the ones this profile actually renders, with a scroll-spy
 * highlight on the section nearest the top of the viewport. Hidden below the
 * `--mobile` breakpoint (see `.snav` in `ProfileRail.module.css`) — mobile
 * has no equivalent jump list today.
 */
function ProfileSectionNav({ profile }: { profile: Member }) {
  const { t } = useTranslation();
  const visibleItems = PROFILE_SECTION_NAV_ITEMS.filter((item) =>
    item.isVisible(profile),
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
