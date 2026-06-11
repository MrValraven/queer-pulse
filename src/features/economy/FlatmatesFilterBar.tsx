import { LIFESTYLE_TAGS, NEIGHBOURHOODS, type ListingType } from './flatmates.data'
import styles from './FlatmatesPage.module.css'

interface FilterBarProps {
  type: ListingType | 'all'
  setType: (t: ListingType | 'all') => void
  neighbourhood: string
  setNeighbourhood: (v: string) => void
  budget: string
  setBudget: (v: string) => void
  movein: string
  setMovein: (v: string) => void
  tags: string[]
  toggleTag: (t: string) => void
}

export function FlatmatesFilterBar({
  type,
  setType,
  neighbourhood,
  setNeighbourhood,
  budget,
  setBudget,
  movein,
  setMovein,
  tags,
  toggleTag,
}: FilterBarProps) {
  return (
    <div className={styles.filterBar}>
      <div className="wrap">
        <div className={styles.filterRow}>
          <span className={styles.fLabel}>Show</span>
          {(['all', 'seeking', 'offering'] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={[styles.typeChip, type === t && styles.typeOn].filter(Boolean).join(' ')}
              onClick={() => setType(t)}
            >
              {t === 'all' ? 'All profiles' : t === 'seeking' ? 'Seeking a room' : 'Offering a room'}
            </button>
          ))}
          <div className={styles.spacer} />
          <select className={styles.fSelect} value={neighbourhood} onChange={(e) => setNeighbourhood(e.target.value)}>
            <option value="all">Any neighbourhood</option>
            {NEIGHBOURHOODS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <select className={styles.fSelect} value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="all">Any budget</option>
            <option value="600">Up to €700</option>
            <option value="700">€700–900</option>
            <option value="900">€900–1,100</option>
            <option value="1100">€1,100+</option>
          </select>
          <select className={styles.fSelect} value={movein} onChange={(e) => setMovein(e.target.value)}>
            <option value="all">Any move-in</option>
            <option value="now">Available now</option>
            <option value="jul">July</option>
            <option value="aug">August</option>
            <option value="flex">Flexible</option>
          </select>
        </div>
        <div className={styles.filterRow}>
          <span className={styles.fLabel}>Lifestyle</span>
          {LIFESTYLE_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              className={[styles.tagChip, tags.includes(t) && styles.tagOn].filter(Boolean).join(' ')}
              onClick={() => toggleTag(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
