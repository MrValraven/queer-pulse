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
import { linkToPath, routes } from '../../../app/routeMap'
import { useConnect } from '../../../app/providers/ConnectProvider'
import { members, memberFilters, visibilitySay } from '../data/members'
import { filterMembers } from '../lib/filters'
import type { Member } from '../data/types'
import styles from './Discovery.module.css'

function MemberCard({ member }: { member: Member }) {
  const { openConnect } = useConnect()
  const isPrivate = member.visibility === 'private'

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.vbadge}>
          <Avatar
            initials={member.initials}
            tint={member.tint}
            size={60}
            verified={member.verified}
            src={member.photo}
            alt={member.name}
          />
          {member.verified && (
            <span className={styles.vtip}>Vouched by {member.vouchedBy}</span>
          )}
        </div>
        <VisibilityBadge mode={member.visibility} />
      </div>

      <div>
        <Link to={`${routes.members}/${member.key}`}>
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
        {isPrivate ? (
          <Link to={linkToPath(`${routes.members}/${member.key}`)} className={styles.connect}>
            View profile <span aria-hidden>→</span>
          </Link>
        ) : (
          <span
            role="button"
            tabIndex={0}
            className={styles.connect}
            onClick={() => openConnect(member.key)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                openConnect(member.key)
              }
            }}
          >
            Say hello <span aria-hidden>→</span>
          </span>
        )}
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
