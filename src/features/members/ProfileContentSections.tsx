import { Link } from "react-router-dom";
import { FiArrowRight, FiExternalLink } from "react-icons/fi";
import { useMemberContact } from "../connect/useMemberContact";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Avatar, ImageSlot } from "../../shared/components/ui";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { memberProfiles, type MemberProfile } from "./data/memberProfiles";
import type { ActivityItem } from "./data/members";
import type { RelatedMember, WorkItem } from "./data/members";
import { SHAPING_META } from "./profileSections.data";
import { Section } from "./ProfileSections";
import { BoardRow } from "./BoardRow";
import { openToLabel, reasonValue } from "./openTo.data";
import { workLinkTarget, type WorkLink } from "./workLink.data";
import styles from "./ProfilePage.module.css";

export function NowSection({
  profile,
  isSelf = false,
}: {
  profile: MemberProfile;
  /** Your own chips are inert — there's no one to reach out to. */
  isSelf?: boolean;
}) {
  const { t } = useTranslation();
  const { contact } = useMemberContact(profile.slug);
  // Nothing to say and no chips to offer — an empty card reads as a bug.
  if (!profile.now?.trim() && profile.openTo.length === 0) return null;
  return (
    <Section
      id="now"
      title={t("members:content.now.title")}
      subtitle={t("members:content.now.subtitle", { first: profile.first })}
    >
      <div className={styles.nowCard}>
        <span className={styles.nowDot} aria-hidden />
        <div className={styles.nowBody}>
          {profile.now?.trim() && <p>{profile.now}</p>}
          {profile.openTo.length > 0 && (
            <div className={styles.nowOpen}>
              <span className="lbl">{t("members:content.now.openLabel")}</span>
              {profile.openTo.map((entry) => {
                const label = openToLabel(entry, t);
                return isSelf ? (
                  <span key={reasonValue(entry)} className={styles.openChip}>
                    {label}
                  </span>
                ) : (
                  <button
                    key={reasonValue(entry)}
                    type="button"
                    className={`${styles.openChip} ${styles.openChipAction}`}
                    onClick={() =>
                      contact(
                        {
                          slug: profile.slug,
                          name: `${profile.first} ${profile.last}`,
                        },
                        reasonValue(entry),
                      )
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/** One work-item link rendered as a small affordance, distinctly labeled by
 *  target kind (internal ref vs. off-platform URL) — up to two of these sit
 *  side by side per card, so the whole card can no longer double as a single
 *  giant link the way a lone link used to render. Invalid targets (see
 *  `workLinkTarget`) render nothing rather than a dead affordance. */
function WorkLinkChip({ link }: { link: WorkLink }) {
  const { t } = useTranslation();
  const target = workLinkTarget(link);
  if (!target) return null;
  if (target.kind === "internal") {
    return (
      <Link to={target.to} className={styles.workLinkChip}>
        {t("members:content.work.viewLink")}
        <FiArrowRight aria-hidden />
      </Link>
    );
  }
  return (
    <a
      href={target.href}
      target="_blank"
      rel="noreferrer noopener"
      className={styles.workLinkChip}
    >
      {t("members:content.work.visitLink")}
      <FiExternalLink aria-hidden />
    </a>
  );
}

function WorkCardBody({ item, index }: { item: WorkItem; index: number }) {
  const { t } = useTranslation();
  return (
    <>
      <ImageSlot
        tint={(["coral", "jade", "plum"] as const)[index % 3]}
        src={item.image}
        height={200}
        radius={14}
        placeholder={t("members:workItem.imagePlaceholder")}
        style={{ marginBottom: 14 }}
      />
      <div className={styles.workCat}>{item.category}</div>
      <h3>{item.title}</h3>
      <div className={styles.workYear}>{item.year}</div>
      {item.links.length > 0 && (
        <div className={styles.workLinks}>
          {/* 0-2 fixed entries, never reordered/filtered/inserted at render
           *  time and with no stable id of their own, so a positional key
           *  is safe here. */}
          {item.links.map((link, linkIndex) => (
            <WorkLinkChip key={linkIndex} link={link} />
          ))}
        </div>
      )}
    </>
  );
}

export function SelectedWorkSection({ profile }: { profile: MemberProfile }) {
  const { t } = useTranslation();
  if (profile.work.length === 0) return null;
  return (
    <Section
      id="selected-work"
      title={t("members:content.work.title")}
      subtitle={t("members:content.work.subtitle")}
    >
      <div className={styles.workGrid}>
        {profile.work.map((item, index) => (
          <article key={item.title} className={styles.workCard}>
            <WorkCardBody item={item} index={index} />
          </article>
        ))}
      </div>
    </Section>
  );
}

export function BoardSection({
  profile,
  isSelf = false,
}: {
  profile: MemberProfile;
  /** Self-only: shows the "Mark as found" close action on open posts. */
  isSelf?: boolean;
}) {
  const { t } = useTranslation();
  if (profile.board.length === 0) return null;
  return (
    <Section
      id="board"
      title={t("members:content.board.title")}
      subtitle={t("members:content.board.subtitle", { first: profile.first })}
    >
      <div className={styles.miniBoard}>
        {profile.board.map((item) => (
          <BoardRow key={item.slug} item={item} isSelf={isSelf} />
        ))}
      </div>
    </Section>
  );
}

export function SkillsSection({ profile }: { profile: MemberProfile }) {
  const { t } = useTranslation();
  if (profile.skills.length === 0) return null;
  return (
    <Section
      id="skills"
      title={t("members:content.skills.title")}
      subtitle={t("members:content.skills.subtitle", { first: profile.first })}
    >
      <div className={styles.skillsGrid}>
        {profile.skills.map((skill) => (
          <div key={skill.name} className={styles.skillCard}>
            <div className={styles.skillName}>{skill.name}</div>
            <div className={styles.skillMeta}>{skill.meta}</div>
          </div>
        ))}
      </div>
      <Link to={routes.barter} className={styles.barterLink}>
        {t("members:content.skills.barterCta")} <FiArrowRight aria-hidden />
      </Link>
    </Section>
  );
}

export function GroupsSection({ profile }: { profile: MemberProfile }) {
  const { t } = useTranslation();
  if (profile.groups.length === 0) return null;
  return (
    <Section
      id="groups"
      title={t("members:content.groups.title")}
      subtitle={t("members:content.groups.subtitle", { first: profile.first })}
    >
      <div className={styles.groupsGrid}>
        {profile.groups.map((group) => (
          <div key={group.name} className={styles.groupCard}>
            <div className={styles.groupName}>{group.name}</div>
            <div className={styles.groupType}>{group.role}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function ShapingsSection({ profile }: { profile: MemberProfile }) {
  const { t } = useTranslation();
  if (Object.keys(profile.shapings).length === 0) return null;
  return (
    <Section
      id="shapings"
      title={t("members:content.shapings.title")}
      subtitle={t("members:content.shapings.subtitle")}
    >
      <div className={styles.shapingsGrid}>
        {(["film", "book", "song", "moment"] as const).map((key) => {
          const item = profile.shapings[key];
          if (!item) return null;
          const Icon = SHAPING_META[key]!.icon;
          return (
            <div key={key} className={styles.shapingCard}>
              <div className={styles.shapingLabel}>
                <Icon />
                &ensp;{t(SHAPING_META[key]!.labelKey)}
              </div>
              <div className={styles.shapingTitle}>{item.title}</div>
              <div className={styles.shapingNote}>{item.note}</div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export function ActivitySection({ profile }: { profile: MemberProfile }) {
  const { t } = useTranslation();
  if (profile.activity.length === 0) return null;
  return (
    <Section
      title={t("members:content.activity.title")}
      subtitle={t("members:content.activity.subtitle")}
    >
      <div className={styles.activityList}>
        {profile.activity.map((item, index) => (
          <ActivityRow key={`${item.title}-${index}`} item={item} />
        ))}
      </div>
    </Section>
  );
}

/**
 * One "Recent activity" row.
 *
 * A row links only when the backend gave it a destination, and it only does
 * that for a subject that is already public to the reader: a public gathering,
 * a forum thread, a public community or one of its posts, a published persona.
 * The backend re-checks that on every read, so a subject made private later
 * takes its whole row away rather than leaving a link that 404s. A row with no
 * destination is still a true statement, so it renders as plain text instead
 * of a dead link.
 */
function ActivityRow({ item }: { item: ActivityItem }) {
  const body = (
    <>
      <span className={styles.actIcon} aria-hidden>
        <item.icon />
      </span>
      <span className={styles.actBody}>
        <span className={styles.actTitle}>{item.title}</span>
        {item.sub ? <span className={styles.actSub}>{item.sub}</span> : null}
      </span>
    </>
  );
  if (!item.to) {
    return <div className={styles.actItem}>{body}</div>;
  }
  return (
    <Link to={item.to} className={styles.actItem}>
      {body}
    </Link>
  );
}

export function RelatedSection({ profile }: { profile: MemberProfile }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // Live mode: the backend returns pre-resolved related cards; unresolved `related`
  // slugs render nothing (real members aren't in the mock registry). Demo mode only:
  // resolve the `related` slugs against the mock registry as a fallback.
  const relatedMembers: RelatedMember[] = profile.relatedCards?.length
    ? profile.relatedCards
    : demoMode
      ? profile.related.flatMap((relatedSlug) => {
          const registryMember = memberProfiles[relatedSlug];
          if (!registryMember) return [];
          return [
            {
              slug: relatedSlug,
              first: registryMember.first,
              last: registryMember.last,
              role: registryMember.role,
              hood: registryMember.hood,
              initials: registryMember.initials,
              tint: registryMember.tint,
              avatarUrl: registryMember.photo,
            },
          ];
        })
      : [];
  if (relatedMembers.length === 0) return null;
  return (
    <Section
      id="related"
      title={t("members:content.related.title")}
      subtitle={t("members:content.related.subtitle")}
    >
      <div className={styles.relGrid}>
        {relatedMembers.map((relatedMember) => (
          <Link
            key={relatedMember.slug}
            to={`/members/${relatedMember.slug}`}
            className={styles.relCard}
          >
            <Avatar
              initials={relatedMember.initials}
              tint={relatedMember.tint}
              src={relatedMember.avatarUrl}
              alt={`${relatedMember.first} ${relatedMember.last}`}
              size={46}
            />
            <div>
              <div className={styles.relName}>
                <span className={styles.nameRow}>
                  {relatedMember.first} {relatedMember.last}
                  <MemberStaffBadge slug={relatedMember.slug} />
                </span>
              </div>
              <div className={styles.relRole}>
                {relatedMember.role.split("·")[0]!.trim()}
                {relatedMember.hood ? ` · ${relatedMember.hood}` : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
