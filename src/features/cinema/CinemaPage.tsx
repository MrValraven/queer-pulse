import { Link } from 'react-router-dom'
import { Button, ImageSlot } from '../../shared/components/ui'
import { CinemaShell } from './CinemaShell'
import { coverFilm, collections, films, liveEvents, shorts } from './data'
import styles from './CinemaPage.module.css'

const SECTION_NAV = ['This week', 'Browse all', 'Collections', 'Documentaries', 'Features', 'Shorts', 'Series', 'Open calls']
const accessClass = { free: styles.free, member: styles.member, rent: styles.rent }
const badgeClass: Record<string, string> = { premiere: styles.bgPremiere, party: styles.bgParty, live: styles.bgLive }

export function CinemaPage() {
  return (
    <CinemaShell>
      <section className={styles.mast}>
        <div className="wrap">
          <div className={styles.mastRow}>
            <div>
              <div className={styles.issue}>Programme — Week 23 · 2026</div>
              <h1 className={styles.mastBrand}>
                Queer<em>Pulse</em> Cinema
              </h1>
            </div>
            <div className={styles.mastMeta}>
              <div className={styles.issue}>8 — 14 June</div>
              <div className={styles.mastTag}>
                A theatre, an archive, a co-op. <em>Eighty percent of every rent</em> goes to the
                filmmaker.
              </div>
            </div>
          </div>
          <div className={styles.secNav}>
            {SECTION_NAV.map((label, i) => (
              <Link
                key={label}
                to="/cinema/browse"
                className={[styles.cnLink, i === 0 && styles.cnLinkActive].filter(Boolean).join(' ')}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.askStrip}>
        <div className="wrap">
          <div className={styles.askInner}>
            <div className={styles.askText}>
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2.2} strokeLinecap="round">
                <circle cx={12} cy={12} r={10} />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              Not sure what to watch? Tell us your mood and we'll pick one film — no algorithm, just
              curators.
            </div>
            <Button to="/cinema/browse">Ask the room →</Button>
          </div>
        </div>
      </div>

      <section className={styles.cover}>
        <div className={styles.cvImg}>
          <ImageSlot tint="plum" width="100%" height="100%" radius={0} placeholder="cover film · poster" style={{ position: 'absolute', inset: 0 }} />
          <div className={styles.cvOverlay} />
          <div className={styles.cvMarks}>
            <span className="pulse" />
            <span>Now showing</span>
            <span className="dot" />
            <span>Free for sustainers</span>
            <span className="dot" />
            <span>Live Q&amp;A · Wed 21:00</span>
          </div>
        </div>
        <div className={styles.cvText}>
          <div className={styles.cvKicker}>{coverFilm.kicker}</div>
          <h2 className={styles.cvTitle}>
            {coverFilm.titlePre}
            <em>{coverFilm.titleEm}</em>
            {coverFilm.titlePost}
          </h2>
          <div className={styles.cvMetaLine}>{coverFilm.meta}</div>
          <div className={styles.cvCurator}>
            <div className="who">{coverFilm.curatorWho}</div>
            <div className="cbody">{coverFilm.curatorBody}</div>
          </div>
          <div className={styles.cvActions}>
            <Button size="lg" to="/film">
              Watch now
            </Button>
            <Button variant="ghost-dark" to="/film">
              Rent · €3
            </Button>
            <Button variant="ghost-dark" to="/rsvp">
              RSVP live Q&amp;A
            </Button>
          </div>
          <div className={styles.cvSplit}>
            If you rent, <strong>€2.40 goes directly to Maria.</strong> €0.60 covers payments &amp;
            hosting.
          </div>
        </div>
      </section>

      <section className={styles.body}>
        <div className="wrap">
          {/* Programme */}
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
                <Link key={film.id} to="/film" className={styles.film}>
                  <div className={styles.poster}>
                    <ImageSlot tint={film.tint} width="100%" height="100%" radius={14} placeholder="poster" style={{ position: 'absolute', inset: 0 }} />
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
                  “We chose six films this week that share one thing: they refuse the cleanness of
                  the coming-out arc. They are messy, slow, alive. <em>Watch them in the order you
                  want.</em>”
                </p>
                <div className={styles.sig}>
                  — Sara Marques, programming lead. <Link to="/cinema/browse">Read the full note →</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Collections */}
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
                    <span className="av" style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(232,119,90,.22)', color: '#ffc4af', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 10 }}>
                      {c.av}
                    </span>
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

          {/* Made here */}
          <div className={styles.sec}>
            <div className={styles.secH}>
              <h2>
                Made <em>here</em>
              </h2>
              <div className="sub">Shorts &amp; mid-lengths from QueerPulse members. Free to watch, paid to make.</div>
              <Link to="/submit-story" className="all">
                Submit your film →
              </Link>
            </div>
            <div className={styles.shortGrid}>
              {shorts.map((s) => (
                <Link key={s.titlePre} to="/film" className={styles.short}>
                  <div className={styles.shortEyebrow}>{s.eyebrow}</div>
                  <h4>
                    {s.titlePre}
                    {s.titleEm && <em>{s.titleEm}</em>}
                    {s.titlePost}
                  </h4>
                  <p>{s.desc}</p>
                  <div className={styles.shortMeta}>{s.meta}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Live */}
          <div className={styles.sec}>
            <div className={styles.secH}>
              <h2>
                Live <em>this week</em>
              </h2>
              <div className="sub">Premieres, Q&amp;As, watch parties. Hosted by members, open by default.</div>
              <Link to="/calendar" className="all">
                Full calendar →
              </Link>
            </div>
            <div className={styles.liveList}>
              {liveEvents.map((e) => (
                <div key={e.day} className={styles.liveRow}>
                  <div className={styles.liveDate}>
                    <div className="d">{e.day}</div>
                    <div className="m">{e.dow}</div>
                  </div>
                  <div className={styles.liveMain}>
                    <h4>
                      {e.titlePre}
                      <em>{e.titleEm}</em>
                      {e.titlePost}
                    </h4>
                    <div className={styles.lmSub}>{e.sub}</div>
                    <div className={styles.lmTags}>
                      <span className={`${styles.bg} ${badgeClass[e.badgeClass]}`}>{e.badge}</span>
                      {e.tags.map((t, i) => (
                        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                          {i >= 0 && <span className="dot" />}
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost-dark" to="/rsvp">
                    RSVP
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Ledger */}
          <div className={styles.ledger}>
            <div className={styles.ledgerText}>
              <div className={styles.ledgerEb}>How this works</div>
              <h2>
                The room <em>pays</em> the filmmaker.
              </h2>
              <p>
                QueerPulse Cinema runs as a co-op. 80% of every rent or buy goes to the filmmaker.
                100% of every tip. The rest covers payments, hosting, and captioning. The ledger is
                public. The split is non-negotiable.
              </p>
              <div className={styles.ledgerActions}>
                <Button to="/cinema/membership">Become a sustainer · €7/mo</Button>
                <Button variant="ghost-dark" to="/governance">
                  Read the co-op deed
                </Button>
              </div>
            </div>
            <div className={styles.ledgerCard}>
              <div className={styles.lcHead}>
                <span className="live" />
                Public ledger · this month
              </div>
              <div className={styles.lcRow}>
                <span className="k">Paid to filmmakers</span>
                <span className="v">€<em>8,420</em></span>
              </div>
              <div className={styles.lcRow}>
                <span className="k">Films streamed</span>
                <span className="v">14,<em>207</em></span>
              </div>
              <div className={styles.lcRow}>
                <span className="k">Average filmmaker share</span>
                <span className="v"><em>82</em>%</span>
              </div>
              <div className={styles.lcRow}>
                <span className="k">Open commissions</span>
                <span className="v"><em>4</em></span>
              </div>
              <div className={styles.lcFoot}>Updated every Monday at noon Lisbon. Audited quarterly.</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Watch <em>together</em>.
          </h2>
          <p>Cinema is a room with people in it. The room is open.</p>
          <Button size="lg" to="/cinema/membership">
            Sustain the cinema
          </Button>
        </div>
      </section>
    </CinemaShell>
  )
}
