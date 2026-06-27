import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, SkeletonAvatar, SkeletonLine } from '../../shared/components/ui'
import { fullName, memberProfiles } from './data/memberProfiles'
import {
  ALL_PROFESSIONS,
  DISCIPLINES,
  FIELD_BY_PROFESSION,
  IDENTITY,
  LANGUAGES,
  NEIGHBOURHOODS,
  OPEN_TO,
  PROFESSIONS_BY_FIELD,
  professionsForFields,
  type ChipOption,
  type FilterState,
  type MemberCard,
} from './memberDirectoryFilter.data'
import styles from './MemberDirectoryFilterPage.module.css'

/** Toggle a value within a string[] immutably. */
function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

/** A controlled row of selectable chips driven by `selected`. */
function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: ChipOption[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className={styles.chipRow}>
      {options.map((opt) => {
        const on = selected.includes(opt.label)
        return (
          <button
            key={opt.label}
            type="button"
            aria-pressed={on}
            className={[styles.chip, on && styles.chipActive].filter(Boolean).join(' ')}
            onClick={() => onToggle(opt.label)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function FiltersSidebar({
  filters,
  appliedCount,
  onChange,
  onClearAll,
}: {
  filters: FilterState
  appliedCount: number
  onChange: (next: FilterState) => void
  onClearAll: () => void
}) {
  // Free-text search across fields and professions. When non-empty it widens the
  // profession list to every matching profession (regardless of selected field)
  // so any role is reachable by typing it.
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const disciplineOptions = q
    ? DISCIPLINES.filter(
        (d) =>
          d.label.toLowerCase().includes(q) ||
          (PROFESSIONS_BY_FIELD[d.label] ?? []).some((p) => p.toLowerCase().includes(q)),
      )
    : DISCIPLINES
  const professionPool = q
    ? ALL_PROFESSIONS.filter((p) => p.toLowerCase().includes(q))
    : professionsForFields(filters.disciplines)

  // Toggling a profession on also selects its parent field, so the choice
  // survives `reconcileProfessions` and the field chip lights up to match.
  const toggleProfession = (value: string) => {
    const has = filters.professions.includes(value)
    const professions = has
      ? filters.professions.filter((p) => p !== value)
      : [...filters.professions, value]
    const field = FIELD_BY_PROFESSION[value]
    const disciplines =
      !has && field && !filters.disciplines.includes(field)
        ? [...filters.disciplines, field]
        : filters.disciplines
    onChange({ ...filters, professions, disciplines })
  }

  return (
    <aside className={styles.filters}>
      <div className={styles.filterCard}>
        <h4>What they're open to</h4>
        {OPEN_TO.map((o) => (
          <label key={o.label} className={styles.filterRow}>
            <input
              type="checkbox"
              checked={filters.openTo.includes(o.label)}
              onChange={() => onChange({ ...filters, openTo: toggle(filters.openTo, o.label) })}
            />
            {o.label}
            <span className={styles.ct}>{o.count}</span>
          </label>
        ))}
      </div>

      <div className={styles.filterCard}>
        <h4>Where they're based</h4>
        <ChipGroup
          options={NEIGHBOURHOODS}
          selected={filters.hoods}
          onToggle={(value) => onChange({ ...filters, hoods: toggle(filters.hoods, value) })}
        />
      </div>

      <div className={styles.filterCard}>
        <h4>What they do</h4>
        <input
          type="search"
          className={styles.search}
          placeholder="Search a field or profession…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search fields and professions"
        />
        {disciplineOptions.length > 0 ? (
          <ChipGroup
            options={disciplineOptions}
            selected={filters.disciplines}
            onToggle={(value) =>
              onChange({ ...filters, disciplines: toggle(filters.disciplines, value) })
            }
          />
        ) : (
          <p className={styles.rangeNote}>
            <em>No field matches "{query}".</em>
          </p>
        )}
      </div>

      <div className={styles.filterCard}>
        <h4>Profession</h4>
        {professionPool.length > 0 ? (
          <ChipGroup
            options={professionPool.map((p) => ({ label: p }))}
            selected={filters.professions}
            onToggle={toggleProfession}
          />
        ) : (
          <p className={styles.rangeNote}>
            <em>No profession matches "{query}".</em>
          </p>
        )}
        <p className={styles.rangeNote}>
          {q ? (
            <em>Matching your search across every field.</em>
          ) : filters.disciplines.length ? (
            <em>Showing professions within your selected field{filters.disciplines.length > 1 ? 's' : ''}.</em>
          ) : (
            <em>Pick a field above, or search to find any profession.</em>
          )}
        </p>
      </div>

      <div className={styles.filterCard}>
        <h4>Identity · self-declared</h4>
        {IDENTITY.map((o) => (
          <label key={o.label} className={styles.filterRow}>
            <input
              type="checkbox"
              checked={filters.identities.includes(o.label)}
              onChange={() =>
                onChange({ ...filters, identities: toggle(filters.identities, o.label) })
              }
            />
            {o.label}
            <span className={styles.ct}>{o.count}</span>
          </label>
        ))}
      </div>

      <div className={styles.filterCard}>
        <h4>Member age</h4>
        <div className={styles.range}>
          <input
            type="number"
            placeholder="From"
            min={0}
            max={9}
            value={filters.yearsFrom}
            onChange={(e) =>
              onChange({ ...filters, yearsFrom: Math.max(0, Number(e.target.value) || 0) })
            }
          />
          <span>→</span>
          <input
            type="number"
            placeholder="Years"
            min={0}
            max={9}
            value={filters.yearsTo}
            onChange={(e) =>
              onChange({ ...filters, yearsTo: Math.max(0, Number(e.target.value) || 0) })
            }
          />
        </div>
        <p className={styles.rangeNote}>
          Years on QueerPulse. <em>Newer members appear with a "first year" badge by default.</em>
        </p>
      </div>

      <div className={styles.filterCard}>
        <h4>Languages</h4>
        <ChipGroup
          options={LANGUAGES}
          selected={filters.languages}
          onToggle={(value) =>
            onChange({ ...filters, languages: toggle(filters.languages, value) })
          }
        />
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

/** Loading placeholder mirroring MemberResultCard exactly — no layout shift. */
export function MemberResultSkeleton() {
  return (
    <div className={styles.mCard} aria-hidden>
      <div className={styles.mHead}>
        <SkeletonAvatar size={48} />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="62%" height={17} />
          <SkeletonLine width="40%" height={11} style={{ marginTop: 7 }} />
        </div>
      </div>
      <SkeletonLine width="90%" height={13} />
      <div className={styles.mTags}>
        <SkeletonLine width={64} height={18} />
        <SkeletonLine width={52} height={18} />
        <SkeletonLine width={72} height={18} />
      </div>
      <div className={styles.mFoot}>
        <SkeletonLine width="35%" height={11} />
        <SkeletonLine width="22%" height={11} />
      </div>
    </div>
  )
}

export function MemberResultCard({ member }: { member: MemberCard }) {
  const m = memberProfiles[member.slug]
  const name = fullName(m)
  return (
    <Link to={`/members/${member.slug}`} className={styles.mCard}>
      <div className={styles.mHead}>
        <Avatar initials={m.initials} tint={m.tint} src={m.photo} size={48} alt={name} />
        <div>
          <div className={styles.mName}>{name}</div>
          <div className={styles.mPron}>{member.meta}</div>
        </div>
      </div>
      <div className={styles.mRole}>{member.role}</div>
      <div className={styles.mTags}>
        {member.tags.map((tag) => (
          <span
            key={tag.label}
            className={[styles.mTag, tag.match && styles.mTagMatch].filter(Boolean).join(' ')}
          >
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
