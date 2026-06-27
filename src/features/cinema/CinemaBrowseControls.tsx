import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ACCESS_FILTERS,
  FORMATS,
  MADE_BY,
  COUNTRIES,
  ACCESSIBILITY,
  MOODS,
  SORT_OPTIONS,
  type BrowseFilters,
  type SortKey,
} from './cinemaBrowse.data'
import styles from './CinemaBrowsePage.module.css'

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.group}>
      <div className={styles.gLabel}>{label}</div>
      <div className={styles.gChips}>{children}</div>
    </div>
  )
}

/** A multi-select chip group bound to a Set in the filter state. */
function ChipGroup({
  label,
  options,
  selected,
  onToggle,
  jade,
}: {
  label: string
  options: readonly string[]
  selected: Set<string>
  onToggle: (value: string) => void
  jade?: boolean
}) {
  return (
    <FilterGroup label={label}>
      {options.map((opt) => {
        const on = selected.has(opt)
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={on}
            className={[styles.chip, jade && styles.chipJade, on && styles.chipOn].filter(Boolean).join(' ')}
            onClick={() => onToggle(opt)}
          >
            {opt}
          </button>
        )
      })}
    </FilterGroup>
  )
}

export function CinemaBrowseSidebar({
  filters,
  toggleSet,
  setFormat,
  onClear,
}: {
  filters: BrowseFilters
  toggleSet: (key: 'access' | 'madeBy' | 'country' | 'accessibility' | 'mood', value: string) => void
  setFormat: (value: string) => void
  onClear: () => void
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sfHead}>
        <h3>
          Filter <em>&amp;</em> sort
        </h3>
        <span
          className={styles.clear}
          role="button"
          tabIndex={0}
          onClick={onClear}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onClear()
            }
          }}
        >
          Clear all
        </span>
      </div>

      <FilterGroup label="Access">
        {ACCESS_FILTERS.map((a) => (
          <button
            key={a.value}
            type="button"
            aria-pressed={filters.access.has(a.value)}
            className={[styles.chip, filters.access.has(a.value) && styles.chipOn].filter(Boolean).join(' ')}
            onClick={() => toggleSet('access', a.value)}
          >
            {a.label}
          </button>
        ))}
      </FilterGroup>

      <FilterGroup label="Format">
        {FORMATS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filters.format === f}
            className={[styles.chip, filters.format === f && styles.chipOn].filter(Boolean).join(' ')}
            onClick={() => setFormat(f)}
          >
            {f}
          </button>
        ))}
      </FilterGroup>

      <ChipGroup label="Made by" options={MADE_BY} selected={filters.madeBy} onToggle={(v) => toggleSet('madeBy', v)} />
      <ChipGroup label="Country of origin" options={COUNTRIES} selected={filters.country} onToggle={(v) => toggleSet('country', v)} />
      <ChipGroup label="Accessibility" options={ACCESSIBILITY} selected={filters.accessibility} onToggle={(v) => toggleSet('accessibility', v)} jade />
      <ChipGroup label="Mood" options={MOODS} selected={filters.mood} onToggle={(v) => toggleSet('mood', v)} />
    </aside>
  )
}

/** Real <select>-style dropdown for sorting results. */
export function SortDropdown({ value, onChange }: { value: SortKey; onChange: (key: SortKey) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0]

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className={styles.sortWrap} ref={ref}>
      <button type="button" className={styles.sortSel} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {current.label}
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <ul className={styles.sortMenu} role="listbox">
          {SORT_OPTIONS.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={[styles.sortOpt, o.value === value && styles.sortOptOn].filter(Boolean).join(' ')}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
