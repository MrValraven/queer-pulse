import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Eyebrow, Reveal, SkeletonLine, Tag, TagRow } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useVouch } from "../../app/providers/useVouch";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { type MemberProfile } from "./data/memberProfiles";
import { useRecognition } from "./api/useRecognition";
import { curatorSlugForName } from "../cinema/cinemaCurator.data";
import { HeroVouchRow } from "./HeroVouchRow";
import { ProfileBioLanguageToggle } from "./ProfileBioLanguageToggle";
import { ProfileBoundaryNote } from "./ProfileBoundaryNote";
import { ProfileHeroActions } from "./ProfileHeroActions";
import { ProfileNamePronunciation } from "./ProfileNamePronunciation";
import { ProfileSafetyMenu } from "./ProfileSafetyMenu";
import { PublicProfileBadge } from "./PublicProfileBadge";
import { SocialLinksRow } from "./SocialLinksRow";
import { VISIBILITY_LABEL_KEY } from "./profileSections.data";
import pageStyles from "./ProfilePage.module.css";
import styles from "./ProfileHeroMain.module.css";

interface ProfileHeroMainProps {
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
 * role/pronouns/staff badge, curator link, the self-only recognition strip,
 * bio (with the EN/PT toggle), "here for" chips, tags, the boundary note,
 * social links, the CTA row (say hello / vouch / safety menu) and the vouch
 * row. Decomposed from the former monolithic `ProfileHero` in
 * `ProfileSections.tsx`, which is now a thin composer of this component,
 * `ProfileRail` (the left column — portrait, location, trust signals, rail
 * controls, section nav) and — for a visitor viewing someone else's profile —
 * `ProfileMutualsCard`, floating beside this column rather than inline
 * within it.
 */
export function ProfileHeroMain({
  profile,
  self,
  asVisitor = false,
  onEdit,
  onEditLinks,
  onPreview,
}: ProfileHeroMainProps) {
  const { t } = useTranslation();
  const { hasVouched, removeVouch } = useVouch();
  // `self` is resolved by the page against the authenticated user, same as
  // `ProfileRail`. `isSelf` folds in the visitor-preview gate: true only when
  // this really is your own profile AND you're not previewing it as a
  // visitor would see it — this is what gates the edit CTA, the public-
  // profile badge, and the recognition strip. `self` on its own (ignoring
  // preview) gates things that must never show on your own profile at all,
  // preview or not: the safety menu and the mutuals row.
  const isSelf = Boolean(self) && !asVisitor;
  const vouched = hasVouched(profile.slug);
  const curatorSlug = curatorSlugForName(`${profile.first} ${profile.last}`);

  return (
    <Reveal delay={80} className={styles.pheroMain}>
      <Eyebrow live className={styles.eyebrow}>
        {t(VISIBILITY_LABEL_KEY[profile.visibility])}
      </Eyebrow>
      <div className={styles.heroNameRow}>
        <h1 className={styles.name}>
          {profile.first} <em>{profile.last}</em>
        </h1>
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
        <MemberStaffBadge slug={profile.slug} size="lg" />
      </div>
      {curatorSlug && (
        <Link
          className={styles.curatorLink}
          to={`${routes.cinemaCurator}/${curatorSlug}`}
        >
          {t("members:profile.hero.curatorLink")}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      )}
      {isSelf && <HeroRecognition />}
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
                {intentLabel}
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
      <ProfileBoundaryNote profile={profile} self={isSelf} />
      <SocialLinksRow links={profile.socials} self={isSelf} onEdit={onEditLinks} />
      <div className={styles.ctaRow}>
        <ProfileHeroActions
          profile={profile}
          isSelf={isSelf}
          asVisitor={asVisitor}
          realSelf={Boolean(self)}
          onEdit={onEdit}
          onPreview={onPreview}
        />
        {/* Safety controls only on another member's profile — never your own
            (raw `self` covers both self view and self-as-visitor preview). */}
        {!self && (
          <ProfileSafetyMenu
            slug={profile.slug}
            firstName={profile.first}
            onWithdrawVouch={vouched ? () => removeVouch(profile.slug) : undefined}
          />
        )}
      </div>
      <HeroVouchRow profile={profile} realSelf={Boolean(self)} isSelf={isSelf} />
    </Reveal>
  );
}

/**
 * A quiet, self-only recognition strip that lives in the profile hero meta
 * zone: three small chips (level, badges, perks) that link through to their
 * pages. Deliberately subtle — no heading, no card — so it reads as
 * secondary hero meta rather than a headline section. Rendered only on your
 * own profile.
 */
function HeroRecognition() {
  const { t } = useTranslation();
  const { level, badges, perks, hasRealData } = useRecognition();
  // Until real recognition data lands in live mode, skeleton the chips rather
  // than flash the demo placeholder's fictional level/badge/perk counts.
  if (!hasRealData) {
    return (
      <div className={styles.heroRecog} aria-hidden>
        <SkeletonLine width={128} height={26} />
        <SkeletonLine width={92} height={26} />
        <SkeletonLine width={108} height={26} />
      </div>
    );
  }
  const totalBadges = badges.earnedCount + badges.discoverCount;
  return (
    <div className={styles.heroRecog}>
      <Link
        to={routes.badges}
        className={`${styles.heroRecogChip} ${styles.accent}`}
      >
        {t("members:profile.hero.levelLabel", { number: level.level })} ·{" "}
        {level.name}
      </Link>
      <Link to={routes.badges} className={styles.heroRecogChip}>
        {t("members:profile.hero.badgesChip", {
          earned: badges.earnedCount,
          total: totalBadges,
        })}
      </Link>
      <Link
        to={routes.perks}
        className={`${styles.heroRecogChip} ${styles.jade}`}
      >
        {t("members:profile.hero.perksChip", { count: perks.availableCount })}
      </Link>
    </div>
  );
}
