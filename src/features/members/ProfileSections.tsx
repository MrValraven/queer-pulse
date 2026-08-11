import { type ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import {
  Eyebrow,
  ImageSlot,
  Reveal,
  SkeletonLine,
  Tag,
  TagRow,
} from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { currentUserSlug, type MemberProfile } from "./data/memberProfiles";
import { useRecognition } from "./api/useRecognition";
import { HeroVouchRow } from "./HeroVouchRow";
import { ProfileNetworkStats } from "./ProfileNetworkStats";
import { ProfileHeroActions } from "./ProfileHeroActions";
import { ProfilePhotoViewer } from "./ProfilePhotoViewer";
import { ProfileSafetyMenu } from "./ProfileSafetyMenu";
import { PublicProfileBadge } from "./PublicProfileBadge";
import { VISIBILITY_LABEL_KEY } from "./profileSections.data";
import { curatorSlugForName } from "../cinema/cinemaCurator.data";
import {
  ActivitySection,
  BoardSection,
  GroupsSection,
  NowSection,
  RelatedSection,
  SelectedWorkSection,
  ShapingsSection,
  SkillsSection,
} from "./ProfileContentSections";
import { LookingForEditor } from "./LookingForEditor";
import { SocialLinksRow } from "./SocialLinksRow";
import { WorkEditor } from "./WorkEditor";
import { BoardEditor } from "./BoardEditor";
import { SkillsEditor } from "./SkillsEditor";
import { GroupsEditor } from "./GroupsEditor";
import styles from "./ProfilePage.module.css";

function CheckIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5l4 4L19 7"
        stroke="var(--cream)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Reveal as="section" className={styles.section}>
      <div className={styles.sectionHead}>
        <h2>{title}</h2>
        {subtitle && <span className={styles.sectionSub}>{subtitle}</span>}
      </div>
      {children}
    </Reveal>
  );
}

export function ProfileHero({
  profile,
  self,
  asVisitor = false,
  onEdit,
  onEditLinks,
  onPreview,
}: {
  profile: MemberProfile;
  /**
   * Whether this is the viewer's own profile. Passed down from the page, which
   * resolves it against the authenticated user — don't re-derive it from a
   * hardcoded slug here, because in live mode the user's slug isn't `currentUserSlug`.
   */
  self?: boolean;
  /** When true, render your own profile exactly as a visitor would see it. */
  asVisitor?: boolean;
  /** Enter inline edit mode (only used on your own profile). */
  onEdit?: () => void;
  /** Enter inline edit mode jumped to the Links section (your own profile). */
  onEditLinks?: () => void;
  /** Preview your profile as a visitor (only used on your own profile). */
  onPreview?: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // Prefer the `self` prop resolved by the page against the authenticated user.
  // Only the demo prototype may re-derive self from the hardcoded persona slug —
  // in live mode the user's slug isn't `currentUserSlug`, so that comparison
  // would wrongly flag another member's profile as your own.
  const realSelf = self ?? (demoMode && profile.slug === currentUserSlug);
  const isSelf = realSelf && !asVisitor;
  const curatorSlug = curatorSlugForName(`${profile.first} ${profile.last}`);
  const [photoOpen, setPhotoOpen] = useState(false);
  const fullName = `${profile.first} ${profile.last}`;
  const portraitTint = profile.tint === "auth" ? "plum" : profile.tint;
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
    <header className={styles.phero}>
      <div className="wrap">
        <div className={styles.pheroGrid}>
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
                <CheckIcon />
                {t("members:profile.hero.verifiedBadge")}
              </span>
            )}
          </Reveal>

          <Reveal delay={80}>
            <Eyebrow live className={styles.eyebrow}>
              {t(VISIBILITY_LABEL_KEY[profile.visibility])}
            </Eyebrow>
            <div className={styles.heroNameRow}>
              <h1 className={styles.name}>
                {profile.first} <em>{profile.last}</em>
              </h1>
              {isSelf && <PublicProfileBadge />}
            </div>
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
            <div className={styles.where}>
              <span className={styles.loc}>
                <span className={styles.pin} aria-hidden />
                {t("members:profile.hero.location", { hood: profile.hood })}
              </span>
              {profile.since && (
                <span className={styles.muted}>
                  {t("members:profile.hero.memberSince", {
                    since: profile.since,
                  })}
                </span>
              )}
            </div>
            {isSelf && <HeroRecognition />}
            {profile.lookingFor &&
              profile.lookingFor.length > 0 &&
              (isSelf || profile.lookingForPublic) && (
                <div className={styles.hereFor}>
                  <span className={styles.hereForLabel}>
                    {t("members:hero.hereFor.label")}
                  </span>
                  {profile.lookingFor.map((intentLabel) => (
                    <span key={intentLabel} className={styles.hereForChip}>
                      {intentLabel}
                    </span>
                  ))}
                  {isSelf && (
                    <span className={styles.hereForHint}>
                      {profile.lookingForPublic
                        ? t("members:hero.hereFor.hintPublic")
                        : t("members:hero.hereFor.hintPrivate")}
                    </span>
                  )}
                </div>
              )}
            <p className={styles.bio}>{profile.bio}</p>
            <TagRow style={{ marginTop: 20 }}>
              {profile.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </TagRow>
            {/* Private "Your network" chips — owner-only. `isSelf` here already
                folds in the visitor-preview gate (asVisitor), so it matches the
                old below-hero section's `isSelf && selfView` guard exactly. */}
            {isSelf && <ProfileNetworkStats ownerSlug={profile.slug} />}
            <SocialLinksRow
              links={profile.socials}
              self={isSelf}
              onEdit={onEditLinks}
            />
            <div className={styles.heroActionsRow}>
              <ProfileHeroActions
                profile={profile}
                isSelf={isSelf}
                asVisitor={asVisitor}
                realSelf={realSelf}
                onEdit={onEdit}
                onPreview={onPreview}
              />
              {/* Safety controls only on another member's profile — never your
                  own (realSelf covers both self view and self-as-visitor preview). */}
              {!realSelf && (
                <ProfileSafetyMenu
                  slug={profile.slug}
                  firstName={profile.first}
                />
              )}
            </div>
            <HeroVouchRow
              profile={profile}
              realSelf={realSelf}
              isSelf={isSelf}
            />
          </Reveal>
        </div>
      </div>
      {photoOpen && profile.photo && (
        <ProfilePhotoViewer
          src={profile.photo}
          name={fullName}
          tint={portraitTint}
          onClose={() => setPhotoOpen(false)}
        />
      )}
    </header>
  );
}

/**
 * A quiet, self-only recognition strip that lives in the profile hero meta zone:
 * three small chips (level, badges, perks) that link through to their pages.
 * Deliberately subtle — no heading, no card — so it reads as secondary hero meta
 * rather than a headline section. Rendered only on your own profile.
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

/** The editable profile lists surfaced as inline editors while in edit mode. */
export interface ProfileContentEdit {
  work: MemberProfile["work"];
  skills: MemberProfile["skills"];
  groups: MemberProfile["groups"];
  board: MemberProfile["board"];
  update: (
    patch: Partial<{
      work: MemberProfile["work"];
      skills: MemberProfile["skills"];
      groups: MemberProfile["groups"];
      board: MemberProfile["board"];
    }>,
  ) => void;
}

export function ProfileContent({
  profile,
  isSelf,
  edit,
}: {
  profile: MemberProfile;
  isSelf?: boolean;
  /** When set (edit mode), the editable sections become inline editors bound to
   *  the draft. Sections with no editor (Shapings, Activity, Related) are hidden
   *  while editing rather than shown read-only with no affordance. */
  edit?: ProfileContentEdit;
}) {
  return (
    <div className="wrap">
      {/* While editing, the Now editor lives in the hero — showing the committed
          card here too would just be a stale second copy of the same field. */}
      {!edit && <NowSection profile={profile} isSelf={isSelf} />}
      {edit && <LookingForEditor />}
      {edit ? (
        <WorkEditor
          work={edit.work}
          onChange={(work) => edit.update({ work })}
        />
      ) : (
        <SelectedWorkSection profile={profile} />
      )}
      {edit ? (
        <BoardEditor
          board={edit.board}
          onChange={(board) => edit.update({ board })}
        />
      ) : (
        <BoardSection profile={profile} />
      )}
      {edit ? (
        <SkillsEditor
          skills={edit.skills}
          onChange={(skills) => edit.update({ skills })}
        />
      ) : (
        <SkillsSection profile={profile} />
      )}
      {edit ? (
        <GroupsEditor
          groups={edit.groups}
          onChange={(groups) => edit.update({ groups })}
        />
      ) : (
        <GroupsSection profile={profile} />
      )}
      {!edit && <ShapingsSection profile={profile} />}
      {!edit && <ActivitySection profile={profile} />}
      {!edit && <RelatedSection profile={profile} />}
    </div>
  );
}
