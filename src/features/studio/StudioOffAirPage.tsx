import { useToast } from '../../shared/components/feedback/useToast'
import { ImageSlot } from '../../shared/components/ui'
import { linkToPath } from '../../app/routeMap'
import { Link } from 'react-router-dom'
import { StudioShell } from './StudioShell'
import { OFF_AIR_LIBRARY, QUIET_HOURS } from './studioOffAir.data'
import studioStyles from './studio.module.css'
import styles from './StudioOffAirPage.module.css'

export function StudioOffAirPage() {
  const { showToast } = useToast()

  return (
    <StudioShell>
      {/* Off-air hero */}
      <section className={styles.offairHero}>
        <div className={styles.offairInner}>
          <div className={styles.offairEb}>
            <svg className={styles.moon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
            Off air · 03:14 in Lisbon
            <span className={styles.sep} aria-hidden />
            the room is dark
          </div>

          <h1>
            The room is <em>closed</em> for the night.
          </h1>

          <p className={styles.signoff}>
            "We played fourteen songs and paid fourteen people. Go to sleep — the catalogue stays
            open, and we'll be back when the kettle's on."
            <span className={styles.signoffWho}>
              — Sara Marques, closing the Wednesday set at 01:58
            </span>
          </p>

          {/* Next broadcast */}
          <div className={styles.nextStrip}>
            <div className={styles.clock}>
              <div className={styles.clockTime}>
                <em>04</em>:46
              </div>
              <div className={styles.clockLabel}>until doors</div>
            </div>
            <div className={styles.vr} aria-hidden />
            <div className={styles.nsInfo}>
              <div className={styles.nsEb}>Next broadcast · 08:00 Lisbon</div>
              <h3>
                Morning pages with <em>D. Okoye</em>
              </h3>
              <p>Ambient &amp; trans composers · 90 minutes · captioned live</p>
            </div>
          </div>

          {/* Night-cap replay */}
          <div className={styles.nightcap}>
            <div className={styles.ncCover}>
              <ImageSlot tint="plum" width={78} height={78} radius={10} placeholder="set art" />
            </div>
            <div className={styles.ncInfo}>
              <div className={styles.ncEb}>Last night's night-cap</div>
              <h3>
                Vespertina, <em>vol. iv</em>
              </h3>
              <p>Sara Marques · 1h 42m · 12 tracks · €8.20 paid out · replay any time</p>
            </div>
            <button
              className={styles.playBig}
              aria-label="Replay the night-cap"
              onClick={() => showToast('Replaying Vespertina, vol. iv', 'success')}
            >
              <svg viewBox="0 0 12 14" fill="currentColor" aria-hidden>
                <path d="M1 1l10 6-10 6z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <p className={styles.browseNote}>
        The doors are shut, but the shelves are open.{' '}
        <em>Browse anything below</em> — it all still plays.
      </p>

      {/* Carry on section */}
      <section className={studioStyles.row} style={{ paddingTop: 24 }}>
        <div className={studioStyles.rowH}>
          <h2>
            Carry on where you <em>left off</em>
          </h2>
          <div style={{ fontSize: 13, color: 'rgba(247,243,238,.4)' }}>
            From your library · plays on, broadcast or not
          </div>
          <Link to={linkToPath('QueerPulse Studio Library.html')} style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: 'rgba(247,243,238,.6)' }}>
            Library →
          </Link>
        </div>
        <div className={studioStyles.rowGrid}>
          {OFF_AIR_LIBRARY.map((item) => (
            <Link key={item.title} to={linkToPath(item.to)} className={studioStyles.card}>
              <div className={studioStyles.cardCov}>
                <ImageSlot tint={item.tint} width="100%" height="100%" radius={10} placeholder="cover" />
                {item.tag && (
                  <span className={`${studioStyles.tag} ${item.tag === 'mem' ? studioStyles.tagMem : studioStyles.tagFree}`}>
                    {item.tagLabel}
                  </span>
                )}
              </div>
              {item.curator && <div style={{ fontSize: 12, color: 'rgba(247,243,238,.5)' }}>{item.curator}</div>}
              <h4 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 15, color: 'rgba(247,243,238,.92)', letterSpacing: '-0.01em' }}>
                {item.title} <em>{item.titleEm}</em>
              </h4>
              <div style={{ fontSize: 12, color: 'rgba(247,243,238,.4)' }}>{item.meta}</div>
              {item.pay && <div style={{ fontSize: 12, color: 'rgba(247,243,238,.4)' }}>per play <em style={{ color: 'var(--accent)' }}>€0.05</em></div>}
            </Link>
          ))}
        </div>
      </section>

      {/* Quiet hours section */}
      <section className={studioStyles.row} style={{ paddingBottom: 50 }}>
        <div className={studioStyles.rowH}>
          <h2>
            For the <em>small hours</em>
          </h2>
          <div style={{ fontSize: 13, color: 'rgba(247,243,238,.4)' }}>
            Council collections that don't need the lights on
          </div>
          <Link to={linkToPath('QueerPulse Studio Search.html')} style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: 'rgba(247,243,238,.6)' }}>
            All →
          </Link>
        </div>
        <div className={studioStyles.rowGrid}>
          {QUIET_HOURS.map((item) => (
            <Link key={item.title} to={linkToPath(item.to)} className={studioStyles.card}>
              <div className={studioStyles.cardCov}>
                <ImageSlot tint={item.tint} width="100%" height="100%" radius={10} placeholder="cover" />
              </div>
              <div style={{ fontSize: 12, color: 'rgba(247,243,238,.5)' }}>{item.curator}</div>
              <h4 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 15, color: 'rgba(247,243,238,.92)', letterSpacing: '-0.01em' }}>
                {item.title} <em>{item.titleEm}</em>
              </h4>
              <div style={{ fontSize: 12, color: 'rgba(247,243,238,.4)' }}>{item.meta}</div>
            </Link>
          ))}
        </div>
      </section>
    </StudioShell>
  )
}
