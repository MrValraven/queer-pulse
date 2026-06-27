import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageSlot } from '../../shared/components/ui'
import { StudioShell } from './StudioShell'
import { LIBRARY, TABS } from './studioLibrary.data'
import ss from './studio.module.css'
import s from './studioPages.module.css'

export function StudioLibraryPage() {
  const [tab, setTab] = useState<string>('Albums')
  const items = LIBRARY[tab] ?? []

  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>Your library</div>
        <h1>
          Everything you've <em>kept.</em>
        </h1>
        <div className={s.dek}>
          Saved albums, sets, and tracks — and the <em>€312</em> you've paid 47 artists this year by
          listening here.
        </div>
      </div>

      <div className={s.tabs}>
        {TABS.map((option) => (
          <button
            key={option}
            type="button"
            className={`${s.tab} ${tab === option ? s.tabOn : ''}`}
            onClick={() => setTab(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <section className={ss.row}>
        {items.length === 0 ? (
          <p className={s.empty}>Nothing saved here yet.</p>
        ) : (
          <div className={ss.rowGrid}>
            {items.map((item) => (
              <Link key={item.pre + item.meta} to={item.to} className={ss.card}>
                <div className={ss.cardCov}>
                  <ImageSlot src={item.image} tint={item.tint} width="100%" height="100%" radius={10} placeholder="cv" style={{ position: 'absolute', inset: 0 }} />
                </div>
                <h4>
                  {item.pre}
                  {item.em && <em>{item.em}</em>}
                  {item.post}
                </h4>
                <div className={ss.meta}>{item.meta}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </StudioShell>
  )
}
