import { useMemo, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button, FadeIn } from '../../shared/components/ui'
import { useCountUp, useSimulatedLoad } from '../../shared/hooks'
import { useToast } from '../../shared/components/feedback/useToast'
import {
  DEFAULT_FILTERS,
  MEMBERS,
  PAGE_SIZE,
  SORTS,
  TOTAL_MEMBERS,
  appliedChips,
  matchesFilters,
  reconcileProfessions,
  sortMembers,
  type AppliedChip,
  type FilterState,
  type SortKey,
} from './memberDirectoryFilter.data'
import { FiltersSidebar, MemberResultCard, MemberResultSkeleton } from './MemberFilterCards'
import styles from './MemberDirectoryFilterPage.module.css'

/** Remove one value from whichever filter group a chip belongs to. */
function removeChip(filters: FilterState, chip: AppliedChip): FilterState {
  const drop = (arr: string[]) => arr.filter((v) => v !== chip.value)
  switch (chip.group) {
    case 'openTo':
      return { ...filters, openTo: drop(filters.openTo) }
    case 'hood':
      return { ...filters, hoods: drop(filters.hoods) }
    case 'discipline':
      return { ...filters, disciplines: drop(filters.disciplines) }
    case 'profession':
      return { ...filters, professions: drop(filters.professions) }
    case 'identity':
      return { ...filters, identities: drop(filters.identities) }
    case 'language':
      return { ...filters, languages: drop(filters.languages) }
  }
}

export function MemberDirectoryFilterPage() {
  const { showToast } = useToast()
  const loading = useSimulatedLoad()
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortKey>('Recently active')
  const [visible, setVisible] = useState(PAGE_SIZE)

  // Count the headline figure up from zero once, on mount — a quick settle that
  // says "this is a real, countable population". Reduced motion jumps to the total.
  const countedTotal = useCountUp(TOTAL_MEMBERS)

  const filtered = useMemo(() => {
    const matched = MEMBERS.filter((m) => matchesFilters(m, filters))
    return sortMembers(matched, sort)
  }, [filters, sort])

  const chips = useMemo(() => appliedChips(filters), [filters])
  const shown = filtered.slice(0, visible)
  const remaining = filtered.length - shown.length

  // Reset paging whenever the result set changes underneath us, and keep the
  // profession selection coherent with the chosen fields.
  const applyFilters = (next: FilterState) => {
    setFilters(reconcileProfessions(next))
    setVisible(PAGE_SIZE)
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>Members · advanced filter</div>
          <h1 className={styles.h1}>
            Find{' '}
            <em>
              <span className={styles.tally}>{countedTotal.toLocaleString()}</span> members,
            </em>{' '}
            exactly.
          </h1>
          <p className={styles.lead}>
            Filter by what they offer, where they're based, what they're <b>open to</b>. The same
            data goes both ways — members appear here because they opted in to be findable for these
            reasons.
          </p>
        </header>

        <div className={styles.grid}>
          <FiltersSidebar
            filters={filters}
            appliedCount={chips.length}
            onChange={applyFilters}
            onClearAll={() => {
              applyFilters({
                openTo: [],
                hoods: [],
                disciplines: [],
                professions: [],
                identities: [],
                languages: [],
                yearsFrom: 0,
                yearsTo: 9,
              })
              showToast('Filters cleared', 'info')
            }}
          />

          <main>
            <div className={styles.topRow}>
              <div className={styles.count}>
                Showing{' '}
                <b>
                  <em>{filtered.length.toLocaleString()}</em>
                </b>{' '}
                of {TOTAL_MEMBERS.toLocaleString()} members
              </div>
              <div className={styles.sort}>
                <span className={styles.sortLabel}>Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  {SORTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {chips.length > 0 && (
              <div className={styles.appliedRow}>
                {chips.map((chip) => (
                  <span key={`${chip.group}:${chip.value}`} className={styles.applied}>
                    {chip.label}
                    <button
                      type="button"
                      aria-label={`Remove ${chip.label}`}
                      onClick={() => applyFilters(removeChip(filters, chip))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {loading ? (
              <div className={styles.mGrid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <MemberResultSkeleton key={i} />
                ))}
              </div>
            ) : shown.length === 0 ? (
              <div className={styles.noResults}>
                No members match these filters. Try removing a few above.
              </div>
            ) : (
              <div className={styles.mGrid}>
                {shown.map((member, i) => (
                  <FadeIn key={`${member.slug}-${i}`} delay={Math.min(i, 8) * 60}>
                    <MemberResultCard member={member} />
                  </FadeIn>
                ))}
              </div>
            )}

            {remaining > 0 && (
              <div className={styles.loadMore}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                >
                  Load {Math.min(PAGE_SIZE, remaining)} more members
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageShell>
  )
}
