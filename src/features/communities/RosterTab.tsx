import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiCheck, FiMessageCircle } from 'react-icons/fi'
import { Avatar } from '../../shared/components/ui'
import { useConnect } from '../../app/providers/ConnectProvider'
import type { RosterMember } from './community.model'
import { photoOf } from './communityPeople'
import { alsoIn } from './communityConnections'
import { RoleBadge } from './CommunityBadges'
import detail from './CommunityDetailPage.module.css'
import styles from './CommunityHubTabs.module.css'

const ROLE_ORDER: Record<RosterMember['role'], number> = { owner: 0, mod: 1, member: 2 }

export function RosterTab({ roster, total, slug }: { roster: RosterMember[]; total: number; slug: string }) {
  const { openConnect } = useConnect()
  const [q, setQ] = useState('')

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase()
    const sorted = [...roster].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])
    if (!term) return sorted
    return sorted.filter((m) =>
      [m.name, m.role, m.hood, m.pronouns].filter(Boolean).join(' ').toLowerCase().includes(term),
    )
  }, [roster, q])

  return (
    <div>
      <div className={styles.searchRow}>
        <FiSearch aria-hidden className={styles.searchIcon} />
        <input
          className={styles.search}
          aria-label="Search members"
          placeholder="Search members by name, role or neighbourhood…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className={detail.memberGrid}>
        {shown.map((m) => (
          <div className={detail.mCard} key={m.slug ?? m.name}>
            <div className={styles.rosterAv}>
              <Avatar initials={m.initials} tint={m.tint} src={photoOf(m)} size={48} alt={m.name} verified={m.verified} />
            </div>
            <div className={styles.rosterName}>
              {m.slug ? (
                <Link to={`/members/${m.slug}`} className={styles.rosterLink}>
                  {m.name}
                </Link>
              ) : (
                m.name
              )}
            </div>
            <div className={styles.rosterBadgeRow}>
              <RoleBadge role={m.role} />
              {m.verified && (
                <span className={styles.verified}>
                  <FiCheck aria-hidden /> Verified
                </span>
              )}
            </div>
            {m.title && <div className={detail.mRole}>{m.title}</div>}
            <div className={styles.rosterMeta}>
              {[m.pronouns, m.hood].filter(Boolean).join(' · ')}
            </div>
            {(() => {
              const others = alsoIn(m.slug, slug)
              return others.length > 0 ? <div className={styles.alsoIn}>Also a member of {others.join(', ')}</div> : null
            })()}
            <span
              role="button"
              tabIndex={0}
              className={styles.msgBtn}
              onClick={() => openConnect(m.slug)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), openConnect(m.slug))}
            >
              <FiMessageCircle aria-hidden /> Message
            </span>
          </div>
        ))}
      </div>
      <p className={detail.showing}>
        Showing {shown.length} of {total} members
      </p>
    </div>
  )
}
