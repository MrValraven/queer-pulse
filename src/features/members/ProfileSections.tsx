import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiEdit3, FiEye } from "react-icons/fi";
import {
  Avatar,
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
import {
  memberProfiles,
  currentUserSlug,
  type MemberProfile,
} from "./data/memberProfiles";
import { useRecognition } from "./api/useRecognition";
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
  const { openVouch, hasVouched } = useVouch();
  const realSelf = self ?? profile.slug === currentUserSlug;
  const isSelf = realSelf && !asVisitor;
  const vouched = hasVouched(profile.slug);
  const youAdded =
    vouched && !realSelf && !profile.vouchers.includes(currentUserSlug);
  const voucherSlugs = youAdded
    ? [...profile.vouchers, currentUserSlug]
    : profile.vouchers;
  const namesText = !youAdded
    ? profile.voucherNames
    : profile.vouchers.length > 0
      ? `${profile.voucherNames}, plus you`
      : "you";
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
                      <Button size="lg" variant="jade" disabled>
                        <FiCheck aria-hidden /> Vouched for {profile.first}
                      </Button>
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
            <div className={styles.vouchRow}>
              {voucherSlugs.length > 0 ? (
                <>
                  <div className={styles.vouchFaces}>
                    {voucherSlugs.map((slug, index) => {
                      const voucher = memberProfiles[slug];
                      if (!voucher) return null;
                      const name = `${voucher.first} ${voucher.last}`;
                      return (
                        <Link
                          key={slug}
                          to={`/members/${slug}`}
                          className={styles.vouchFace}
                          style={{
                            marginLeft: index === 0 ? 0 : -12,
                            zIndex: voucherSlugs.length - index,
                          }}
                        >
                          <span className={styles.vouchTip}>{name}</span>
                          <Avatar
                            initials={voucher.initials}
                            tint={voucher.tint}
                            size={52}
                            src={voucher.photo}
                            alt={name}
                          />
                        </Link>
                      );
                    })}
                  </div>
                  <div className={styles.vouchText}>
                    Vouched for by <b>{namesText}</b>.
                    <br />
                    That's the only number that matters here.
                  </div>
                </>
              ) : (
                <div className={styles.vouchText}>
                  {isSelf ? (
                    <>
                      No vouches yet. They'll appear here as people who know you
                      add their name — the only number that matters.
                    </>
                  ) : (
                    <>
                      No vouches for {profile.first} yet. If you know them,
                      yours could be the first.
                    </>
                  )}
                </div>
              )}
            </div>
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
}: {
  profile: MemberProfile;
  isSelf?: boolean;
}) {
  return (
    <div className="wrap">
      {isSelf && <RecognitionSection />}
      <NowSection profile={profile} />
      <SelectedWorkSection profile={profile} />
      <BoardSection profile={profile} />
      <SkillsSection profile={profile} />
      <GroupsSection profile={profile} />
      <ShapingsSection profile={profile} />
      <ActivitySection profile={profile} />
      <RelatedSection profile={profile} />
    </div>
  );
}
