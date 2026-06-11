import { useMemo, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button, Reveal } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { BARTERS, MODES, CATS, type Mode } from './barter.data'
import { BarterCard } from './BarterCard'
import styles from './BarterPage.module.css'

export function BarterPage() {
  const { showToast } = useToast()
  const [mode, setMode] = useState<'all' | Mode>('all')
  const [cat, setCat] = useState('all')
  const [query, setQuery] = useState('')

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return BARTERS.filter((b) => {
      if (mode === 'offering' && b.mode === 'seeking') return false
      if (mode === 'seeking' && b.mode === 'offering') return false
      if (cat !== 'all' && b.cat !== cat) return false
      if (q) {
        const hay = (b.offer + b.want + b.offerDetail + b.wantDetail + b.tags.join(' ')).toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [mode, cat, query])

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>Skills Exchange</Reveal>
          <Reveal as="h1" delay={60}>Skills are <em>the currency.</em></Reveal>
          <Reveal as="p" delay={120}>
            A structured barter board — skills for skills, expertise for expertise. No money, no
            platform fees. Post what you can offer and what you're hoping for in return.
          </Reveal>
        </div>
      </div>

      <div className={styles.controls}>
        <div className="wrap">
          <div className={styles.controlsRow}>
            <input
              className={styles.search}
              type="text"
              placeholder="Search the exchange…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className={styles.modeTabs}>
              {MODES.map((m) => (
                <button
                  key={m.value}
                  className={[styles.modeTab, mode === m.value && styles.modeTabActive].filter(Boolean).join(' ')}
                  onClick={() => setMode(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <span className={styles.count}>
              <b>{items.length}</b> post{items.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className={styles.cats}>
            {CATS.map((c) => (
              <button
                key={c.value}
                className={[styles.chip, cat === c.value && styles.chipActive].filter(Boolean).join(' ')}
                onClick={() => setCat(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            {items.length === 0 && (
              <div className={styles.empty}>Nothing matches — try broadening the filters.</div>
            )}
            {items.map((b) => <BarterCard key={b.id} barter={b} />)}
          </div>

          <div className={styles.postStrip}>
            <div>
              <h3>Put something <em>on the table.</em></h3>
              <p>Every exchange starts with a post. Tell the community what you can offer and what you're hoping for in return.</p>
            </div>
            <form
              className={styles.psForm}
              onSubmit={(e) => {
                e.preventDefault()
                showToast('Posted to the exchange', 'success')
              }}
            >
              <input className={styles.psInput} placeholder="I can offer — e.g. Portuguese lessons, logo design…" />
              <input className={styles.psInput} placeholder="I'm looking for — e.g. tax advice, moving help…" />
              <Button type="submit">Post to the exchange →</Button>
            </form>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
