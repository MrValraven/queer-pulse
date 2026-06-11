import { useState, type ReactNode } from 'react'
import { PRONOUN_OPTIONS, LOCATIONS, OPEN_TO_OPTIONS } from './members.data'
import styles from './MembersPage.module.css'

interface FilterSectionProps {
  label: string
  children: ReactNode
}

function FilterSection({ label, children }: FilterSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className={[styles.filterSection, collapsed && styles.collapsed].filter(Boolean).join(' ')}>
      <button className={styles.fsHead} onClick={() => setCollapsed((c) => !c)}>
        <span className={styles.fsLabel}>{label}</span>
        <span className={styles.fsChevron}>▾</span>
      </button>
      {!collapsed && <div>{children}</div>}
    </div>
  )
}

interface Props {
  query: string
  onQueryChange: (q: string) => void
  activeLocations: string[]
  onToggleLocation: (loc: string) => void
}

export function MembersSidebar({ query, onQueryChange, activeLocations, onToggleLocation }: Props) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} width={15} height={15} viewBox="0 0 15 15" fill="none" aria-hidden>
          <circle cx={6.5} cy={6.5} r={5} stroke="currentColor" strokeWidth={1.5} />
          <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
        <input
          className={styles.search}
          type="text"
          placeholder="Search members…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <FilterSection label="Pronouns">
        {PRONOUN_OPTIONS.map((pronoun, index) => (
          <label key={pronoun} className={styles.checkItem}>
            <input type="checkbox" defaultChecked={index < 2} />
            {pronoun}
          </label>
        ))}
      </FilterSection>

      <FilterSection label="Location">
        <div className={styles.locChips}>
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              className={[styles.locChip, activeLocations.includes(loc) && styles.locChipActive].filter(Boolean).join(' ')}
              onClick={() => onToggleLocation(loc)}
            >
              {loc}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Open to">
        {OPEN_TO_OPTIONS.map((item, index) => (
          <label key={item} className={styles.checkItem}>
            <input type="checkbox" defaultChecked={index === 0} />
            {item}
          </label>
        ))}
      </FilterSection>
    </aside>
  )
}
