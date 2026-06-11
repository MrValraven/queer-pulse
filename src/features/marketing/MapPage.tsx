import { useMemo, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { TYPES, VENUES, VIBES, type Venue } from './map.data'
import { LisbonMapSvg } from './LisbonMapSvg'
import { MapVenueCard } from './MapVenueCard'
import s from './MapPage.module.css'

export function MapPage() {
  const [bairro, setBairro] = useState<string | null>(null)
  const [type, setType] = useState('all')
  const [vibes, setVibes] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [been, setBeen] = useState<Record<string, number>>({})

  const items = useMemo(
    () =>
      VENUES.filter((v) => {
        if (bairro && v.bairro !== bairro) return false
        if (type !== 'all' && v.type !== type) return false
        if (vibes.length && !vibes.some((f) => v.vibe.includes(f))) return false
        return true
      }),
    [bairro, type, vibes],
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    items.forEach((v) => {
      c[v.bairro] = (c[v.bairro] ?? 0) + 1
    })
    return c
  }, [items])

  const groups = useMemo(() => {
    if (bairro) return null
    const g: { bairro: string; venues: Venue[] }[] = []
    items.forEach((v) => {
      let grp = g.find((x) => x.bairro === v.bairro)
      if (!grp) {
        grp = { bairro: v.bairro, venues: [] }
        g.push(grp)
      }
      grp.venues.push(v)
    })
    return g
  }, [items, bairro])

  function toggleVibe(v: string) {
    setVibes((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]))
    setExpanded(null)
  }
  function selectBairro(name: string | null) {
    setBairro(name)
    setExpanded(null)
  }

  const renderCard = (v: Venue) => (
    <MapVenueCard
      key={v.id}
      v={v}
      isExpanded={expanded === v.id}
      beenCount={been[v.id] ?? v.beenHere}
      marked={been[v.id] !== undefined}
      onToggle={() => setExpanded(expanded === v.id ? null : v.id)}
      onMarkBeen={() => setBeen((cur) => ({ ...cur, [v.id]: v.beenHere + 1 }))}
    />
  )

  return (
    <PageShell>
      <header className={s.hero}>
        <div className="wrap">
          <div className={s.eye}>Lisbon · Community guide</div>
          <h1>
            The queer <em>city guide</em>
          </h1>
          <p>Bars, clubs, cafés, clinics, bookshops, saunas and community spaces — mapped by people who've actually been there.</p>
          <div className={s.stats}>
            <div className={s.stat}>
              <b>23</b>
              <span>venues listed</span>
            </div>
            <div className={s.stat}>
              <b>8</b>
              <span>neighbourhoods</span>
            </div>
            <div className={s.stat}>
              <b>Community</b>
              <span>maintained</span>
            </div>
          </div>
        </div>
      </header>

      <div className={s.filterBar}>
        <div className="wrap">
          <div className={s.fbInner}>
            <span className={s.fbLabel}>Type</span>
            {TYPES.map((t) => (
              <button key={t.t} className={[s.chip, type === t.t && s.chipOn].filter(Boolean).join(' ')} onClick={() => { setType(t.t); setExpanded(null) }}>
                {t.label}
              </button>
            ))}
            <span className={s.fbSep} />
            <span className={s.fbLabel}>Vibe</span>
            {VIBES.map((v) => (
              <button key={v} className={[s.chip, s.vibe, vibes.includes(v) && s.chipOn].filter(Boolean).join(' ')} onClick={() => toggleVibe(v)}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={s.body}>
          <LisbonMapSvg bairro={bairro} counts={counts} onSelectBairro={selectBairro} />

          <aside className={s.sidebar}>
            <div className={s.sbTop}>
              <div>
                <div className={s.sbHeading}>{bairro ?? 'All venues'}</div>
                <div className={s.sbCount}>
                  <b>{items.length}</b> venue{items.length !== 1 ? 's' : ''}
                </div>
              </div>
              {bairro && (
                <button className={s.clear} onClick={() => selectBairro(null)}>
                  ✕ Clear
                </button>
              )}
            </div>

            {items.length === 0 && <div className={s.empty}>No venues match these filters.</div>}

            {groups
              ? groups.map((g) => (
                  <div key={g.bairro}>
                    <div className={s.groupHead}>{g.bairro}</div>
                    {g.venues.map(renderCard)}
                  </div>
                ))
              : items.map(renderCard)}
          </aside>
        </div>
      </div>
    </PageShell>
  )
}
