import { Link } from 'react-router-dom'
import { Avatar, ImageSlot, KindChip } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { memberProfiles, type MemberProfile } from './data/memberProfiles'
import { SHAPING_META } from './profileSections.data'
import { Section } from './ProfileSections'
import styles from './ProfilePage.module.css'

export function NowSection({ profile }: { profile: MemberProfile }) {
  return (
    <Section title="Now" subtitle={`What ${profile.first} is in the middle of`}>
      <div className={styles.nowCard}>
        <span className={styles.nowDot} aria-hidden />
        <div className={styles.nowBody}>
          <p>{profile.now}</p>
          {profile.openTo.length > 0 && (
            <div className={styles.nowOpen}>
              <span className="lbl">Open to</span>
              {profile.openTo.map((item) => (
                <span key={item} className={styles.openChip}>
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

export function SelectedWorkSection({ profile }: { profile: MemberProfile }) {
  if (profile.work.length === 0) return null
  return (
    <Section title="Selected work" subtitle="A few things, not a portfolio dump">
      <div className={styles.workGrid}>
        {profile.work.map((item, index) => (
          <article key={item.title} className={styles.workCard}>
            <ImageSlot
              tint={(['coral', 'jade', 'plum'] as const)[index % 3]}
              height={200}
              radius={14}
              placeholder="Work"
              style={{ marginBottom: 14 }}
            />
            <div className={styles.workCat}>{item.category}</div>
            <h3>{item.title}</h3>
            <div className={styles.workYear}>{item.year}</div>
          </article>
        ))}
      </div>
    </Section>
  )
}

export function BoardSection({ profile }: { profile: MemberProfile }) {
  if (profile.board.length === 0) return null
  return (
    <Section
      title="On the board"
      subtitle={`What ${profile.first} is asking for and offering right now`}
    >
      <div className={styles.miniBoard}>
        {profile.board.map((item) => (
          <Link key={item.slug} to={`${routes.offer}#${item.slug}`} className={styles.ask}>
            <KindChip kind={item.kind}>
              {item.kind === 'looking' ? 'Looking' : 'Offering'}
            </KindChip>
            <h3>{item.title}</h3>
          </Link>
        ))}
      </div>
    </Section>
  )
}

export function SkillsSection({ profile }: { profile: MemberProfile }) {
  if (profile.skills.length === 0) return null
  return (
    <Section
      title="Skills & offerings"
      subtitle={`What ${profile.first} can help with — and swap on the barter board`}
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
        See the full barter board →
      </Link>
    </Section>
  )
}

export function GroupsSection({ profile }: { profile: MemberProfile }) {
  if (profile.groups.length === 0) return null
  return (
    <Section
      title="Groups & circles"
      subtitle={`Where ${profile.first} shows up in the community`}
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
  )
}

export function ShapingsSection({ profile }: { profile: MemberProfile }) {
  if (Object.keys(profile.shapings).length === 0) return null
  return (
    <Section title="What shaped me" subtitle="Not interests. Formative texts, films, moments.">
      <div className={styles.shapingsGrid}>
        {(['film', 'book', 'song', 'moment'] as const).map((key) => {
          const item = profile.shapings[key]
          if (!item) return null
          const Icon = SHAPING_META[key].icon
          return (
            <div key={key} className={styles.shapingCard}>
              <div className={styles.shapingLabel}>
                <Icon />
                &ensp;{SHAPING_META[key].label}
              </div>
              <div className={styles.shapingTitle}>{item.title}</div>
              <div className={styles.shapingNote}>{item.note}</div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

export function ActivitySection({ profile }: { profile: MemberProfile }) {
  if (profile.activity.length === 0) return null
  return (
    <Section title="Recent activity" subtitle="Public moments from around the platform">
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
  )
}

export function RelatedSection({ profile }: { profile: MemberProfile }) {
  if (profile.related.length === 0) return null
  return (
    <Section title="Also in the room" subtitle="People nearby in craft or neighbourhood">
      <div className={styles.relGrid}>
        {profile.related.map((relSlug) => {
          const related = memberProfiles[relSlug]
          if (!related) return null
          return (
            <Link key={relSlug} to={`/members/${relSlug}`} className={styles.relCard}>
              <Avatar initials={related.initials} tint={related.tint} size={46} />
              <div>
                <div className={styles.relName}>
                  {related.first} {related.last}
                </div>
                <div className={styles.relRole}>
                  {related.role.split('·')[0].trim()} · {related.hood}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Section>
  )
}
