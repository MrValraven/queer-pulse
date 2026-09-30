import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Eyebrow, Reveal, Tag, TagRow } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberAmbassadorTag } from "../../shared/ambassadors/MemberAmbassadorTag";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { type MemberProfile } from "./data/memberProfiles";
import { curatorSlugForName } from "../cinema/cinemaCurator.data";
import { lookingForLabel } from "../settings/interests.data";
import { HeroVouchRow } from "./HeroVouchRow";
import { ProfileBioLanguageToggle } from "./ProfileBioLanguageToggle";
import { ProfileHeroActions } from "./ProfileHeroActions";
import {
  ProfileHeroOverflowMenu,
  type ProfileHeroMenuCallbacks,
} from "./ProfileHeroOverflowMenu";
import { ProfileHeroToolbar } from "./ProfileHeroToolbar";
import { ProfileNamePronunciation } from "./ProfileNamePronunciation";
import { ProfileWorkRow } from "./ProfileWorkRow";
import { PublicProfileBadge } from "./PublicProfileBadge";
import { SocialLinksRow } from "./SocialLinksRow";
import { VISIBILITY_LABEL_KEY } from "./profileSections.data";
import pageStyles from "./ProfilePage.module.css";
import styles from "./ProfileHeroMain.module.css";

interface ProfileHeroMainProps extends ProfileHeroMenuCallbacks {
  profile: MemberProfile;
  /** Whether this is the viewer's own profile, resolved by the page against
   *  the authenticated user (same prop `ProfileHero`/`ProfileRail` receive). */
  self?: boolean;
  /** When true, render your own profile exactly as a visitor would see it. */
  asVisitor?: boolean;
  /** Enter inline edit mode (only used on your own profile). */
  onEdit?: () => void;
  /** Enter inline edit mode jumped to the Links section (your own profile). */
  onEditLinks?: () => void;
  /** Preview your profile as a visitor (only used on your own profile). */
  onPreview?: () => void;
}

/**
 * The profile hero's main column: eyebrow/visibility, name (+ pronunciation),
 * the staff shield beside the name, role/pronouns/ambassador tag, curator
 * link, bio (with the EN/PT toggle), "here for" chips, the "works in" row,
 * tags, social links, the CTA row (say hello / vouch) and the vouch row. The
 * owner actions and the safety menu live in `ProfileHeroToolbar`, on the eyebrow's
 * line. `ProfileHero` (`ProfileSections.tsx`) composes it with `ProfileRail`
 * (the left column) and, for a visitor on someone else's profile,
 * `ProfileMutualsCard`.
 */
export function ProfileHeroMain({
  profile,
  self,
  asVisitor = false,
  onEdit,
  onEditLinks,
  onPreview,
  ...menuCallbacks
}: ProfileHeroMainProps) {
  const { t } = useTranslation();
  // `self` is resolved by the page against the authenticated user, same as
  // `ProfileRail`. `isSelf` folds in the visitor-preview gate: true only when
  // this really is your own profile AND you're not previewing it as a
  // visitor would see it; this is what gates the edit CTA, the public-
  // profile badge. `self` on its own (ignoring
  // preview) gates things that must never show on your own profile at all,
  // preview or not: the safety menu and the mutuals row.
  const isSelf = Boolean(self) && !asVisitor;
  const curatorSlug = curatorSlugForName(`${profile.first} ${profile.last}`);
  const overflowMenu = (
    <ProfileHeroOverflowMenu
      profile={profile}
      isOwnProfile={Boolean(self)}
      isSelf={isSelf}
      {...menuCallbacks}
    />
  );
  const eyebrow = (
    <Eyebrow live>{t(VISIBILITY_LABEL_KEY[profile.visibility])}</Eyebrow>
  );

  return (
    <Reveal delay={80} className={styles.pheroMain}>
      <div className={styles.eyebrowRow}>
        {eyebrow}
        <ProfileHeroToolbar
          isOwnProfile={Boolean(self)}
          isSelf={isSelf}
          onEdit={onEdit}
          onPreview={onPreview}
          menu={overflowMenu}
        />
      </div>
      <div className={styles.heroNameRow}>
        <h1 className={styles.name}>
          {profile.first} <em>{profile.last}</em>
        </h1>
        <MemberStaffBadge slug={profile.slug} size="icon" />
        {isSelf && <PublicProfileBadge />}
      </div>
      <ProfileNamePronunciation profile={profile} />
      <div className={styles.role}>
        <span>
          {profile.role}
          {profile.pronouns && (
            <span className={styles.pronoun}> · {profile.pronouns}</span>
          )}
        </span>
        <MemberAmbassadorTag slug={profile.slug} size="lg" />
      </div>
      {curatorSlug && (
        <Link
          className={styles.curatorLink}
          to={`${routes.cinemaCurator}/${curatorSlug}`}
        >
          {t("members:profile.hero.curatorLink")} <FiArrowRight aria-hidden />
        </Link>
      )}
      <ProfileBioLanguageToggle profile={profile} />
      {profile.lookingFor &&
        profile.lookingFor.length > 0 &&
        (isSelf || profile.lookingForPublic) && (
          <div className={pageStyles.hereFor}>
            <span className={pageStyles.hereForLabel}>
              {t("members:hero.hereFor.label")}
            </span>
            {profile.lookingFor.map((intentLabel) => (
              <span key={intentLabel} className={pageStyles.hereForChip}>
                {lookingForLabel(t, intentLabel)}
              </span>
            ))}
            {isSelf && (
              <span className={pageStyles.hereForHint}>
                {profile.lookingForPublic
                  ? t("members:hero.hereFor.hintPublic")
                  : t("members:hero.hereFor.hintPrivate")}
              </span>
            )}
          </div>
        )}
      <ProfileWorkRow
        profile={profile}
        classNames={{
          row: pageStyles.hereFor,
          label: pageStyles.hereForLabel,
          chip: pageStyles.hereForChip,
        }}
      />
      {profile.tags.length > 0 && (
        <div className={styles.tagsGroup}>
          <span className={pageStyles.hereForLabel}>
            {t("members:hero.tags.label")}
          </span>
          <TagRow>
            {profile.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagRow>
        </div>
      )}
      <SocialLinksRow
        links={profile.socials}
        self={isSelf}
        onEdit={onEditLinks}
      />
      {/* The owner's actions live in the toolbar above, so the row is
          skipped for the owner's own profile. */}
      {!isSelf && (
        <div className={styles.ctaRow}>
          <ProfileHeroActions
            profile={profile}
            asVisitor={asVisitor}
            realSelf={Boolean(self)}
          />
        </div>
      )}
      <HeroVouchRow
        profile={profile}
        realSelf={Boolean(self)}
        isSelf={isSelf}
      />
    </Reveal>
  );
}
