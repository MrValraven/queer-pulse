import { Link } from 'react-router-dom'
import { FiStar } from 'react-icons/fi'
import { Avatar, ImageSlot } from '../../shared/components/ui'
import { collections, films, shorts } from './data'
import styles from './CinemaPage.module.css'
import { routes } from '../../app/routeMap'

const accessClass = { free: styles.free, member: styles.member, rent: styles.rent }

export function ProgrammeSection() {
  return (
    <div className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          This week's <em>programme</em>
        </h2>
        <div className="sub">Six films, hand-picked. Available all week. Rotates Monday at noon Lisbon.</div>
        <Link to="/cinema/browse" className="all">
          All programmes →
        </Link>
      </div>
      <div className={styles.prog}>
        {films.map((film) => (
          <Link key={film.id} to={routes.film} className={styles.film}>
            <div className={styles.poster}>
              <ImageSlot src={film.image} tint={film.tint} width="100%" height="100%" radius={14} placeholder="poster" style={{ position: 'absolute', inset: 0 }} />
              <span className={`${styles.fTag} ${accessClass[film.access]}`}>{film.accessLabel}</span>
            </div>
            <div className={styles.fKicker}>{film.kicker}</div>
            <h3 className={styles.fTitle}>
              {film.titlePre}
              {film.titleEm && <em>{film.titleEm}</em>}
              {film.titlePost}
            </h3>
            <div className={styles.fMeta}>{film.meta}</div>
            <div className={styles.fNote}>
              {film.note} <span className={styles.by}>— {film.by}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.note}>
        <div className={styles.noteTag}>
          Curator's <em>notebook</em>
          <br />
          week 23
        </div>
        <div>
          <p className={styles.nq}>
            “We chose six films this week that share one thing: they refuse the cleanness of the
            coming-out arc. They are messy, slow, alive. <em>Watch them in the order you want.</em>”
          </p>
          <div className={styles.sig}>
            — Sara Marques, programming lead. <Link to="/cinema/browse">Read the full note →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CollectionsSection() {
  return (
    <div className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          Wander a <em>collection</em>
        </h2>
        <div className="sub">Curators build these slowly, over months. They're not playlists — they're arguments.</div>
        <Link to="/cinema/browse" className="all">
          All collections →
        </Link>
      </div>
      <div className={styles.collGrid}>
        {collections.map((c) => (
          <Link key={c.titleEm ?? c.titlePre} to="/cinema/browse" className={styles.coll}>
            <div className={styles.collTag}>{c.tag}</div>
            <h3>
              {c.titlePre}
              {c.titleEm && <em>{c.titleEm}</em>}
              {c.titlePost}
            </h3>
            <p>{c.desc}</p>
            <div className={styles.collBy}>
              <Avatar initials={c.av} tint="coral" size={22} />
              {c.by}
            </div>
            <div className={styles.collCount}>
              <span>{c.count}</span>
              <span>
                <em>{c.total}</em> total
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function MadeHereSection() {
  return (
    <div className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          Made <em>here</em>
        </h2>
        <div className="sub">Shorts &amp; mid-lengths from QueerPulse members. Free to watch, paid to make.</div>
        <Link to={routes.submitStory} className="all">
          Submit your film →
        </Link>
      </div>
      <div className={styles.shortGrid}>
        {shorts.map((s) => (
          <Link key={s.titlePre} to={routes.film} className={styles.short}>
            <div className={styles.shortEyebrow}>{s.eyebrow}</div>
            <h4>
              {s.titlePre}
              {s.titleEm && <em>{s.titleEm}</em>}
              {s.titlePost}
            </h4>
            <p>{s.desc}</p>
            <div className={styles.shortMeta}>
              {s.metaBy} · <FiStar aria-hidden /> {s.metaWatches}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
