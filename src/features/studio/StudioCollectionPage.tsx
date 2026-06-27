import { Link } from 'react-router-dom'
import { FiPlus, FiCheck } from 'react-icons/fi'
import { ImageSlot, FadeIn } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { useSaved } from '../../app/providers/SavedProvider'
import { useToast } from '../../shared/components/feedback/useToast'
import { StudioShell } from './StudioShell'
import { StudioCardGridSkeleton } from './StudioSkeletons'
import { COLLECTION, HERO_COVER, RELATED, TRACKS } from './studioCollection.data'
import ss from './studio.module.css'
import s from './studioPages.module.css'

const COLLECTION_ITEM = {
  id: 'post:studio-collection',
  kind: 'post' as const,
  title: 'Studio collection',
  href: '/studio/collection',
  meta: 'Collection',
}

export function StudioCollectionPage() {
  const { isSaved, toggleSave } = useSaved()
  const { showToast } = useToast()
  const saved = isSaved(COLLECTION_ITEM.id)
  const loading = useSimulatedLoad()

  return (
    <StudioShell>
      <div className={s.collHero}>
        <div className={s.collCov}>
          <ImageSlot src={HERO_COVER} tint="jade" width="100%" height="100%" radius={14} placeholder="collection" style={{ position: 'absolute', inset: 0 }} />
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
            <button onClick={() => { const now = toggleSave(COLLECTION_ITEM); showToast(now ? 'Collection added to your library' : 'Removed from your library', now ? 'success' : 'info') }}>
              {saved ? <><FiCheck /> In library</> : <><FiPlus /> Library</>}
            </button>
            <button onClick={() => showToast('Shuffling the collection', 'info')}>Shuffle</button>
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
        {loading ? (
          <StudioCardGridSkeleton className={ss.rowGrid} count={8} />
        ) : (
          <div className={ss.rowGrid}>
            {TRACKS.map((track, i) => (
              <FadeIn key={track.pre + track.meta} delay={Math.min(i, 8) * 60} as={Link} to="/studio/track" className={ss.card}>
                <div className={ss.cardCov}>
                  <ImageSlot src={track.image} tint={track.tint} width="100%" height="100%" radius={10} placeholder="cv" style={{ position: 'absolute', inset: 0 }} />
                </div>
                <h4>
                  {track.pre}
                  {track.em && <em>{track.em}</em>}
                  {track.post}
                </h4>
                <div className={ss.meta}>{track.meta}</div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      <section className={ss.row}>
        <div className={ss.rowH}>
          <h2>
            Related <em>collections</em>
          </h2>
        </div>
        {loading ? (
          <StudioCardGridSkeleton className={ss.rowGrid} count={4} />
        ) : (
          <div className={ss.rowGrid}>
            {RELATED.map((item, i) => (
              <FadeIn key={item.pre + item.meta} delay={Math.min(i, 8) * 60} as={Link} to="/studio/collection" className={ss.card}>
                <div className={ss.cardCov}>
                  <ImageSlot src={item.image} tint={item.tint} width="100%" height="100%" radius={10} placeholder="cv" style={{ position: 'absolute', inset: 0 }} />
                </div>
                <h4>
                  {item.pre}
                  {item.em && <em>{item.em}</em>}
                </h4>
                <div className={ss.meta}>{item.meta}</div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </StudioShell>
  )
}
