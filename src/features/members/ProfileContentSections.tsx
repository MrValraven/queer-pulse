import { Link } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import { useConnect } from "../../app/providers/ConnectProvider";
import { Avatar, ImageSlot, KindChip } from "../../shared/components/ui";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { memberProfiles, type MemberProfile } from "./data/memberProfiles";
import type { WorkItem } from "./data/members";
import { SHAPING_META } from "./profileSections.data";
import { Section } from "./ProfileSections";
import { openToLabel, reasonValue } from "./openTo.data";
import { workLinkTarget } from "./workLink.data";
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
  const { openConnect } = useConnect();
  // Nothing to say and no chips to offer — an empty card reads as a bug.
  if (!profile.now?.trim() && profile.openTo.length === 0) return null;
  return (
    <Section
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
                      openConnect(profile.slug, reasonValue(entry))
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

export function LookingForSection({
  profile,
  isSelf = false,
}: {
  profile: MemberProfile;
  isSelf?: boolean;
}) {
  const { t } = useTranslation();
  // Non-owners only ever receive a populated list when the member opted in
  // (backend strips it otherwise), so an empty list means "nothing to show".
  if (!profile.lookingFor || profile.lookingFor.length === 0) return null;
  // Belt-and-suspenders: for any non-owner view — including the owner's own
  // "preview as visitor", which renders their populated live profile with
  // isSelf=false — never show the section unless the member opted in. Keeps
  // preview faithful to what a real visitor sees and guards against a private
  // list ever surfacing on a non-owner render.
  if (!isSelf && !profile.lookingForPublic) return null;
  return (
    <Section
      title={t("members:content.lookingFor.title")}
      subtitle={t("members:content.lookingFor.subtitle", {
        first: profile.first,
      })}
    >
      <div className={styles.lookingForChips}>
        {profile.lookingFor.map((label) => (
          <span key={label} className={styles.openChip}>
            {label}
          </span>
        ))}
      </div>
      {isSelf && (
        <p className={styles.lookingForHint}>
          {profile.lookingForPublic
            ? t("members:content.lookingFor.visibleHint")
            : t("members:content.lookingFor.privateHint")}
        </p>
      )}
    </Section>
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
      <h3>
        {item.title}
        {item.link?.kind === "external" && (
          <FiExternalLink className={styles.workExternal} aria-hidden />
        )}
      </h3>
      <div className={styles.workYear}>{item.year}</div>
    </>
  );
}

export function SelectedWorkSection({ profile }: { profile: MemberProfile }) {
  const { t } = useTranslation();
  if (profile.work.length === 0) return null;
  return (
    <Section
      title={t("members:content.work.title")}
      subtitle={t("members:content.work.subtitle")}
    >
      <div className={styles.workGrid}>
        {profile.work.map((item, index) => {
          const target = item.link ? workLinkTarget(item.link) : null;
          const body = <WorkCardBody item={item} index={index} />;
          if (target?.kind === "internal") {
            return (
              <Link
                key={item.title}
                to={target.to}
                className={`${styles.workCard} ${styles.workCardLink}`}
              >
                {body}
              </Link>
            );
          }
          if (target?.kind === "external") {
            return (
              <a
                key={item.title}
                href={target.href}
                target="_blank"
                rel="noreferrer noopener"
                className={`${styles.workCard} ${styles.workCardLink}`}
              >
                {body}
              </a>
            );
          }
          return (
            <article key={item.title} className={styles.workCard}>
              {body}
            </article>
          );
        })}
      </div>
    </Section>
  );
}

export function BoardSection({ profile }: { profile: MemberProfile }) {
  const { t } = useTranslation();
  if (profile.board.length === 0) return null;
  return (
    <Section
      title={t("members:content.board.title")}
      subtitle={t("members:content.board.subtitle", { first: profile.first })}
    >
      <div className={styles.miniBoard}>
        {profile.board.map((item) => (
          <Link
            key={item.slug}
            to={`${routes.offer}#${item.slug}`}
            className={styles.ask}
          >
            <KindChip kind={item.kind}>
              {item.kind === "looking"
                ? t("members:content.board.looking")
                : t("members:content.board.offering")}
            </KindChip>
            <h3>{item.title}</h3>
          </Link>
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
        {t("members:content.skills.barterCta")}
      </Link>
    </Section>
  );
}

export function GroupsSection({ profile }: { profile: MemberProfile }) {
  const { t } = useTranslation();
  if (profile.groups.length === 0) return null;
  return (
    <Section
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
        {profile.activity.map((item) => (
          <Link key={item.title} to={item.to} className={styles.actItem}>
            <span className={styles.actIcon} aria-hidden>
              <item.icon />
            </span>
            <span className={styles.actBody}>
              <span className={styles.actTitle}>{item.title}</span>
              <span className={styles.actSub}>{item.sub}</span>
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

export function RelatedSection({ profile }: { profile: MemberProfile }) {
  const { t } = useTranslation();
  if (profile.related.length === 0) return null;
  return (
    <Section
      title={t("members:content.related.title")}
      subtitle={t("members:content.related.subtitle")}
    >
      <div className={styles.relGrid}>
        {profile.related.map((relSlug) => {
          const related = memberProfiles[relSlug];
          if (!related) return null;
          return (
            <Link
              key={relSlug}
              to={`/members/${relSlug}`}
              className={styles.relCard}
            >
              <Avatar
                initials={related.initials}
                tint={related.tint}
                size={46}
              />
              <div>
                <div className={styles.relName}>
                  <span className={styles.nameRow}>
                    {related.first} {related.last}
                    <MemberStaffBadge slug={relSlug} />
                  </span>
                </div>
                <div className={styles.relRole}>
                  {related.role.split("·")[0]!.trim()} · {related.hood}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
