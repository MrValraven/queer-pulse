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
import { useTranslation } from "../../shared/i18n/useTranslation";
import { currentUserSlug, type MemberProfile } from "./data/memberProfiles";
import { useRecognition } from "./api/useRecognition";
import { HeroVouchRow } from "./HeroVouchRow";
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
  const { openConnect } = useConnect();
  const { openVouch, hasVouched, removeVouch } = useVouch();
  const realSelf = self ?? profile.slug === currentUserSlug;
  const isSelf = realSelf && !asVisitor;
  const vouched = hasVouched(profile.slug);
  const curatorSlug = curatorSlugForName(`${profile.first} ${profile.last}`);
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
                {t("members:profile.hero.verifiedBadge")}
              </span>
            )}
          </Reveal>

          <Reveal delay={80}>
            <Eyebrow live className={styles.eyebrow}>
              {t(VISIBILITY_LABEL_KEY[profile.visibility])}
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
            {curatorSlug && (
              <Link
                className={styles.curatorLink}
                to={`${routes.cinemaCurator}/${curatorSlug}`}
              >
                {t("members:profile.hero.curatorLink")}
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
            <p className={styles.bio}>{profile.bio}</p>
            <TagRow style={{ marginTop: 20 }}>
              {profile.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </TagRow>
            <SocialLinksRow
              links={profile.socials}
              self={isSelf}
              onEdit={onEditLinks}
            />
            <div className={styles.cta}>
              {isSelf ? (
                <>
                  <Button size="lg" onClick={onEdit}>
                    <FiEdit3 aria-hidden /> {t("members:profile.hero.editCta")}
                  </Button>
                  <Button size="lg" variant="ghost" onClick={onPreview}>
                    <FiEye aria-hidden /> {t("members:profile.hero.previewCta")}
                  </Button>
                </>
              ) : (
                <>
                  {profile.visibility === "private" ? (
                    <Button size="lg" variant="ghost" to={routes.invite}>
                      {t("members:profile.hero.requestIntroCta")}
                    </Button>
                  ) : (
                    <Button size="lg" onClick={() => openConnect(profile.slug)}>
                      {t("members:profile.hero.sayHelloCta")}
                    </Button>
                  )}
                  {!realSelf &&
                    (vouched ? (
                      <span className={styles.vouchedActions}>
                        <span className={styles.vouchedTag}>
                          <FiCheck aria-hidden />{" "}
                          {t("members:profile.hero.vouchedFor", {
                            first: profile.first,
                          })}
                        </span>
                        <Button
                          size="lg"
                          variant="ghost"
                          onClick={() => removeVouch(profile.slug)}
                        >
                          <FiX aria-hidden />{" "}
                          {t("members:profile.hero.withdrawVouchCta")}
                        </Button>
                      </span>
                    ) : (
                      <Button
                        size="lg"
                        variant="ghost"
                        onClick={() => openVouch(profile.slug)}
                      >
                        {t("members:profile.hero.vouchForCta", {
                          first: profile.first,
                        })}
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
  const { t } = useTranslation();
  const { level, badges, perks } = useRecognition();
  return (
    <Section
      title={t("members:profile.hero.recognitionTitle")}
      subtitle={t("members:profile.hero.recognitionSubtitle")}
    >
      <div className={styles.recogGrid}>
        <Link to={routes.badges} className={styles.recogCard}>
          <div className={styles.recogTop}>
            <span className={styles.recogChip}>
              {t("members:profile.hero.levelLabel", { number: level.level })} ·{" "}
              {level.name}
            </span>
          </div>
          <div className={styles.recogTitle}>
            {t("members:profile.hero.badgesTitle")}
          </div>
          <div className={styles.recogDesc}>
            {t("members:profile.hero.badgesDesc", {
              earned: badges.earnedCount,
              discover: badges.discoverCount,
            })}
          </div>
          <div className={styles.recogXpBar}>
            <div
              className={styles.recogXpFill}
              style={{ width: `${level.percent}%` }}
            />
          </div>
          <div className={styles.recogArrow}>
            {t("members:profile.hero.badgesArrow")}
          </div>
        </Link>

        <Link to={routes.perks} className={styles.recogCard}>
          <div className={styles.recogTop}>
            <span className={`${styles.recogChip} ${styles.jade}`}>
              {t("members:profile.hero.perksAvailable", {
                count: perks.availableCount,
              })}
            </span>
          </div>
          <div className={styles.recogTitle}>
            {t("members:profile.hero.perksTitle")}
          </div>
          <div className={styles.recogDesc}>
            {t("members:profile.hero.perksDesc")}
          </div>
          <div className={styles.recogArrow}>
            {t("members:profile.hero.perksArrow")}
          </div>
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
