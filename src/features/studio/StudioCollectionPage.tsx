import { Link } from 'react-router-dom'
import { ImageSlot } from '../../shared/components/ui'
import { StudioShell } from './StudioShell'
import { COLLECTION, RELATED, TRACKS } from './studioCollection.data'
import ss from './studio.module.css'
import s from './studioPages.module.css'

export function StudioCollectionPage() {
  return (
    <StudioShell>
      <div className={s.collHero}>
        <div className={s.collCov}>
          <ImageSlot tint="jade" width="100%" height="100%" radius={14} placeholder="collection" style={{ position: 'absolute', inset: 0 }} />
        </div>
        <div className={s.collInfo}>
          <div className={s.eb}>Collection · curated by {COLLECTION.curator}</div>
          <h1>
            {COLLECTION.title}
            <em>{COLLECTION.em}</em>
          </h1>
          <div className={s.collMeta}>
            <strong>{COLLECTION.count}</strong> · {COLLECTION.hours} · 100% paid to artists on every listen
          </div>
          <div className={s.dek}>{COLLECTION.blurb}</div>
          <div className={s.collActions}>
            <button className={ss.playBig} aria-label="Play collection">
              <svg viewBox="0 0 12 14" fill="currentColor">
                <path d="M1 1l10 6-10 6z" />
              </svg>
            </button>
            <button>＋ Library</button>
            <button>Shuffle</button>
          </div>
        </div>
      </div>

      <section className={ss.row}>
        <div className={ss.rowH}>
          <h2>
            In this <em>collection</em>
          </h2>
          <Link to="/studio/search" className={ss.all}>
            Find more →
          </Link>
        </div>
        <div className={ss.rowGrid}>
          {TRACKS.map((track) => (
            <Link key={track.pre + track.meta} to="/studio/track" className={ss.card}>
              <div className={ss.cardCov}>
                <ImageSlot tint={track.tint} width="100%" height="100%" radius={10} placeholder="cv" style={{ position: 'absolute', inset: 0 }} />
              </div>
              <h4>
                {track.pre}
                {track.em && <em>{track.em}</em>}
                {track.post}
              </h4>
              <div className={ss.meta}>{track.meta}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className={ss.row}>
        <div className={ss.rowH}>
          <h2>
            Related <em>collections</em>
          </h2>
        </div>
        <div className={ss.rowGrid}>
          {RELATED.map((item) => (
            <Link key={item.pre + item.meta} to="/studio/collection" className={ss.card}>
              <div className={ss.cardCov}>
                <ImageSlot tint={item.tint} width="100%" height="100%" radius={10} placeholder="cv" style={{ position: 'absolute', inset: 0 }} />
              </div>
              <h4>
                {item.pre}
                {item.em && <em>{item.em}</em>}
              </h4>
              <div className={ss.meta}>{item.meta}</div>
            </Link>
          ))}
        </div>
      </section>
    </StudioShell>
  )
}
