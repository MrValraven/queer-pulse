import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiEdit3, FiEye, FiX } from "react-icons/fi";
import {
  Button,
  Eyebrow,
  ImageSlot,
  Reveal,
  Tag,
  TagRow,
} from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useConnect } from "../../app/providers/ConnectProvider";
import { useVouch } from "../../app/providers/VouchProvider";
import { currentUserSlug, type MemberProfile } from "./data/memberProfiles";
import { useRecognition } from "./api/useRecognition";
import { HeroVouchRow } from "./HeroVouchRow";
import { VISIBILITY_LABEL } from "./profileSections.data";
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
import { SocialLinksRow } from "./SocialLinksRow";
import { WorkEditor } from "./WorkEditor";
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
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Reveal as="section" className={styles.section}>
      <div className={styles.sectionHead}>
        <h2>{title}</h2>
        <span className={styles.sectionSub}>{subtitle}</span>
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
  /** Preview your profile as a visitor (only used on your own profile). */
  onPreview?: () => void;
}) {
  const { openConnect } = useConnect();
  const { openVouch, hasVouched, removeVouch } = useVouch();
  const realSelf = self ?? profile.slug === currentUserSlug;
  const isSelf = realSelf && !asVisitor;
  const vouched = hasVouched(profile.slug);
  return (
    <header className={styles.phero}>
      <div className="wrap">
        <div className={styles.pheroGrid}>
          <Reveal className={styles.portraitWrap}>
            <ImageSlot
              tint={profile.tint === "auth" ? "plum" : profile.tint}
              src={profile.photo}
              initials={profile.initials}
              height={430}
              radius={20}
              placeholder={`${profile.first} ${profile.last}`}
            />
            {profile.verified && (
              <span className={styles.vbadgeLg}>
                <CheckIcon />
                Verified member
              </span>
            )}
          </Reveal>

          <Reveal delay={80}>
            <Eyebrow live className={styles.eyebrow}>
              {VISIBILITY_LABEL[profile.visibility]}
            </Eyebrow>
            <h1 className={styles.name}>
              {profile.first} <em>{profile.last}</em>
            </h1>
            <div className={styles.role}>
              {profile.role}
              {profile.pronouns && (
                <span className={styles.pronoun}> · {profile.pronouns}</span>
              )}
            </div>
            <div className={styles.where}>
              <span className={styles.loc}>
                <span className={styles.pin} aria-hidden />
                {profile.hood}, Lisbon
              </span>
              {profile.since && (
                <span className={styles.muted}>
                  Member since {profile.since}
                </span>
              )}
            </div>
            <p className={styles.bio}>{profile.bio}</p>
            <TagRow style={{ marginTop: 20 }}>
              {profile.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </TagRow>
            <SocialLinksRow links={profile.socials} />
            <div className={styles.cta}>
              {isSelf ? (
                <>
                  <Button size="lg" onClick={onEdit}>
                    <FiEdit3 aria-hidden /> Edit profile
                  </Button>
                  <Button size="lg" variant="ghost" onClick={onPreview}>
                    <FiEye aria-hidden /> View as visitor
                  </Button>
                </>
              ) : (
                <>
                  {profile.visibility === "private" ? (
                    <Button size="lg" variant="ghost" to={routes.invite}>
                      Request an intro
                    </Button>
                  ) : (
                    <Button size="lg" onClick={() => openConnect(profile.slug)}>
                      Say hello
                    </Button>
                  )}
                  {!realSelf &&
                    (vouched ? (
                      <span className={styles.vouchedActions}>
                        <span className={styles.vouchedTag}>
                          <FiCheck aria-hidden /> Vouched for {profile.first}
                        </span>
                        <Button
                          size="lg"
                          variant="ghost"
                          onClick={() => removeVouch(profile.slug)}
                        >
                          <FiX aria-hidden /> Withdraw vouch
                        </Button>
                      </span>
                    ) : (
                      <Button
                        size="lg"
                        variant="ghost"
                        onClick={() => openVouch(profile.slug)}
                      >
                        Vouch for {profile.first}
                      </Button>
                    ))}
                </>
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
    </header>
  );
}

export function RecognitionSection() {
  const { level, badges, perks } = useRecognition();
  return (
    <Section title="Recognition" subtitle="Your level, badges and member perks">
      <div className={styles.recogGrid}>
        <Link to={routes.badges} className={styles.recogCard}>
          <div className={styles.recogTop}>
            <span className={styles.recogChip}>
              Level {level.level} · {level.name}
            </span>
          </div>
          <div className={styles.recogTitle}>Badges &amp; level</div>
          <div className={styles.recogDesc}>
            {badges.earnedCount} earned · {badges.discoverCount} to discover
          </div>
          <div className={styles.recogXpBar}>
            <div
              className={styles.recogXpFill}
              style={{ width: `${level.percent}%` }}
            />
          </div>
          <div className={styles.recogArrow}>See badges &amp; level →</div>
        </Link>

        <Link to={routes.perks} className={styles.recogCard}>
          <div className={styles.recogTop}>
            <span className={`${styles.recogChip} ${styles.jade}`}>
              {perks.availableCount} available
            </span>
          </div>
          <div className={styles.recogTitle}>Member perks</div>
          <div className={styles.recogDesc}>
            Bonuses your level unlocks — early RSVP access, the Trusted Lounge
            and more.
          </div>
          <div className={styles.recogArrow}>Redeem your perks →</div>
        </Link>
      </div>
    </Section>
  );
}

export function ProfileContent({
  profile,
  isSelf,
  workEdit,
}: {
  profile: MemberProfile;
  isSelf?: boolean;
  /** When set (edit mode), the work section becomes an editor bound to the draft. */
  workEdit?: {
    work: MemberProfile["work"];
    onChange: (next: MemberProfile["work"]) => void;
  };
}) {
  return (
    <div className="wrap">
      {isSelf && <RecognitionSection />}
      <NowSection profile={profile} />
      {workEdit ? (
        <WorkEditor work={workEdit.work} onChange={workEdit.onChange} />
      ) : (
        <SelectedWorkSection profile={profile} />
      )}
      <BoardSection profile={profile} />
      <SkillsSection profile={profile} />
      <GroupsSection profile={profile} />
      <ShapingsSection profile={profile} />
      <ActivitySection profile={profile} />
      <RelatedSection profile={profile} />
    </div>
  );
}
