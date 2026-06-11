import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { MusicPlayer } from './MusicPlayer'
import { PROFILE, TINT_BG, TINT_FG, type ArtWork, type MusicArtist } from './creatives.data'
import styles from './CreativesPage.module.css'

export function badgeClass(b: string) {
  if (b.includes('commission') || b.includes('bookings')) return styles.cbCommission
  if (b.includes('exhibition') || b.includes('live')) return styles.cbExhibition
  return styles.cbCollab
}

export function ArtCard({ w }: { w: ArtWork }) {
  return (
    <article className={styles.artCard}>
      <div className={styles.artImg} style={{ height: w.imgH }}>
        {w.medium}
      </div>
      <div className={styles.artCardBody}>
        <div className={styles.artCardTop}>
          <span className={styles.artMedium}>{w.medium}</span>
          <div className={styles.artBadges}>
            {w.badges.map((b) => (
              <span key={b} className={`${styles.badge} ${badgeClass(b)}`}>
                {b === 'commission' ? 'Commission open' : b === 'exhibition' ? 'Exhibition' : b}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.artTitle}>{w.title}</div>
        <div className={styles.artStatement}>{w.statement}</div>
        <div className={styles.artFoot}>
          <div className={styles.artAv} style={{ background: TINT_BG[w.tint], color: TINT_FG[w.tint] }}>
            {w.initials}
          </div>
          <div>
            <div className={styles.artArtist}>{w.artist}</div>
            <div className={styles.artHood}>{w.hood}</div>
          </div>
          <Link to={PROFILE} className={styles.artProfile}>
            View profile →
          </Link>
        </div>
      </div>
    </article>
  )
}

export function MusicCard({
  a,
  active,
  onPlay,
}: {
  a: MusicArtist
  active: boolean
  onPlay: () => void
}) {
  return (
    <article className={styles.musicCard}>
      <div className={styles.mcLeft}>
        <div className={styles.mcImg}>{a.name} — artist photo</div>
        <div>
          <div className={styles.mcName}>{a.name}</div>
          <div className={styles.mcGenre}>{a.genre}</div>
          <div className={styles.mcHood}>
            <span className={styles.pin} />
            {a.hood}
          </div>
        </div>
        <div className={styles.mcBadges}>
          {a.badges.map((b) => (
            <span key={b} className={`${styles.badge} ${badgeClass(b)}`}>
              {b}
            </span>
          ))}
        </div>
        <Button to={PROFILE} variant="ghost" style={{ fontSize: 13, padding: '9px 16px' }}>
          View profile
        </Button>
      </div>
      <div className={styles.mcRight}>
        <p className={styles.mcBio}>{a.bio}</p>
        <MusicPlayer artist={a} active={active} onPlay={onPlay} />
      </div>
    </article>
  )
}
