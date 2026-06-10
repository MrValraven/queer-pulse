import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Avatar,
  Reveal,
  SectionHead,
  Tag,
  TagRow,
  VisibilityBadge,
} from '../../../shared/components/ui'
import { linkToPath } from '../../../app/routeMap'
import { members, memberFilters, visibilitySay } from '../data/members'
import { filterMembers } from '../lib/filters'
import type { Member } from '../data/types'
import styles from './Discovery.module.css'

function MemberCard({ member }: { member: Member }) {
  const connectHref =
    member.visibility === 'private'
      ? `QueerPulse Profile.html#${member.key}`
      : `QueerPulse Connect.html#${member.key}`
  const connectLabel = member.visibility === 'private' ? 'View profile' : 'Say hello'

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.vbadge}>
          <Avatar
            initials={member.initials}
            tint={member.tint}
            size={60}
            verified={member.verified}
          />
          {member.verified && (
            <span className={styles.vtip}>Vouched by {member.vouchedBy}</span>
          )}
        </div>
        <VisibilityBadge mode={member.visibility} />
      </div>

      <div>
        <Link to={linkToPath(`QueerPulse Profile.html#${member.key}`)}>
          <div className={styles.name}>{member.name}</div>
        </Link>
        <div className={styles.role}>{member.role}</div>
        <div className={styles.hood}>
          <span className={styles.pin} aria-hidden />
          {member.hood}
        </div>
      </div>

      <TagRow>
        {member.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </TagRow>

      <div className={styles.foot}>
        <span className={styles.say}>{visibilitySay[member.visibility]}</span>
        <Link to={linkToPath(connectHref)} className={styles.connect}>
          {connectLabel} <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  )
}

export function Discovery() {
  const [filter, setFilter] = useState<'all' | Member['category']>('all')
  const visible = filterMembers(members, filter)

  return (
    <section className={styles.discovery} id="discovery">
      <div className="wrap">
        <Reveal>
          <SectionHead
            className={styles.head}
            title={
              <>
                In the room <em>right now</em>
              </>
            }
          />
        </Reveal>

        <Reveal className={styles.filters} delay={60}>
          {memberFilters.map((option) => (
            <button
              key={option.value}
              type="button"
              className={[styles.chip, filter === option.value && styles.chipActive]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </Reveal>

        <div className={styles.grid}>
          {visible.map((member) => (
            <MemberCard key={member.key} member={member} />
          ))}
        </div>
      </div>
    </section>
  )
}
