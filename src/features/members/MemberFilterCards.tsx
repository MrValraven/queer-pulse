import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routes } from '../../app/routeMap'
import {
  DISCIPLINES,
  IDENTITY,
  LANGUAGES,
  NEIGHBOURHOODS,
  OPEN_TO,
  type ChipOption,
  type MemberCard,
} from './memberDirectoryFilter.data'
import styles from './MemberDirectoryFilterPage.module.css'

const PROFILE = routes.profile

function avClass(tint?: 'jade' | 'plum') {
  if (tint === 'jade') return `${styles.mAv} ${styles.mAvJade}`
  if (tint === 'plum') return `${styles.mAv} ${styles.mAvPlum}`
  return styles.mAv
}

function ChipGroup({ options }: { options: ChipOption[] }) {
  const [active, setActive] = useState(() => new Set(options.filter((o) => o.active).map((o) => o.label)))
  return (
    <div className={styles.chipRow}>
      {options.map((opt) => {
        const on = active.has(opt.label)
        return (
          <button
            key={opt.label}
            type="button"
            className={[styles.chip, on && styles.chipActive].filter(Boolean).join(' ')}
            onClick={() =>
              setActive((prev) => {
                const next = new Set(prev)
                if (next.has(opt.label)) next.delete(opt.label)
                else next.add(opt.label)
                return next
              })
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function FiltersSidebar({ appliedCount, onClearAll }: { appliedCount: number; onClearAll: () => void }) {
  return (
    <aside className={styles.filters}>
      <div className={styles.filterCard}>
        <h4>What they're open to</h4>
        {OPEN_TO.map((o) => (
          <label key={o.label} className={styles.filterRow}>
            <input type="checkbox" defaultChecked={o.checked} />
            {o.label}
            <span className={styles.ct}>{o.count}</span>
          </label>
        ))}
      </div>

      <div className={styles.filterCard}>
        <h4>Where they're based</h4>
        <ChipGroup options={NEIGHBOURHOODS} />
      </div>

      <div className={styles.filterCard}>
        <h4>What they do</h4>
        <ChipGroup options={DISCIPLINES} />
      </div>

      <div className={styles.filterCard}>
        <h4>Identity · self-declared</h4>
        {IDENTITY.map((o) => (
          <label key={o.label} className={styles.filterRow}>
            <input type="checkbox" />
            {o.label}
            <span className={styles.ct}>{o.count}</span>
          </label>
        ))}
      </div>

      <div className={styles.filterCard}>
        <h4>Member age</h4>
        <div className={styles.range}>
          <input type="number" placeholder="From" defaultValue={0} />
          <span>→</span>
          <input type="number" placeholder="Years" defaultValue={3} />
        </div>
        <p className={styles.rangeNote}>
          Years on QueerPulse. <em>Newer members appear with a "first year" badge by default.</em>
        </p>
      </div>

      <div className={styles.filterCard}>
        <h4>Languages</h4>
        <ChipGroup options={LANGUAGES} />
      </div>

      <div className={styles.clearRow}>
        <button type="button" onClick={onClearAll}>
          Clear all filters
        </button>
        <span>{appliedCount} applied</span>
      </div>
    </aside>
  )
}

export function MemberResultCard({ member }: { member: MemberCard }) {
  return (
    <Link to={PROFILE} className={styles.mCard}>
      <div className={styles.mHead}>
        <div className={avClass(member.tint)}>{member.initials}</div>
        <div>
          <div className={styles.mName}>{member.name}</div>
          <div className={styles.mPron}>{member.meta}</div>
        </div>
      </div>
      <div className={styles.mRole}>{member.role}</div>
      <div className={styles.mTags}>
        {member.tags.map((tag) => (
          <span key={tag.label} className={[styles.mTag, tag.match && styles.mTagMatch].filter(Boolean).join(' ')}>
            {tag.label}
          </span>
        ))}
      </div>
      <div className={styles.mFoot}>
        <span className={styles.vouch}>{member.vouch}</span>
        <span>{member.mutuals}</span>
      </div>
    </Link>
  )
}
