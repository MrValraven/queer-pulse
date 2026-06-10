import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button, ImageSlot } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { films } from './data'
import styles from './FilmPage.module.css'

const TIPS = ['€3', '€7', '€15', '€30', '···']
const WATCH_TABS = [
  { label: 'Watch', sub: 'included · sustainer' },
  { label: 'Rent · €3', sub: '48 hrs' },
  { label: 'Buy · €8', sub: 'forever' },
]
const FACTS = [
  { k: 'Language', v: 'Portuguese', ok: false },
  { k: 'Captions', v: 'EN · PT', ok: true },
  { k: 'Audio described', v: 'EN · PT', ok: true },
  { k: 'Sign language', v: 'LGP track', ok: true },
]
const CREW = [
  { initials: 'MV', tone: 'coral', name: 'Maria Vasconcelos', role: 'Director, cinematographer', tags: ['Lesbian', 'PT', 'member'] },
  { initials: 'CB', tone: 'jade', name: 'Cláudia Borges', role: 'Editor', tags: ['Bi', 'PT'] },
  { initials: 'IL', tone: '', name: 'Dona Ilda Pereira', role: 'Featured · Marvila', tags: ['Lesbian', 'b. 1947'] },
  { initials: 'RC', tone: 'coral', name: 'Rui Costa', role: 'Sound recordist, mix', tags: ['Gay', 'PT', 'member'] },
]
const related = films.filter((f) => f.id !== 'cascais').slice(0, 4)

export function FilmPage() {
  const { showToast } = useToast()
  const [tip, setTip] = useState(1)
  const [tab, setTab] = useState(0)

  return (
    <PageShell>
      <section className={styles.crumb}>
        <div className="wrap">
          <div className={styles.crumbRow}>
            <Link to="/cinema">Cinema</Link>
            <span className={styles.sep}>›</span>
            <Link to="/cinema/browse">This week</Link>
            <span className={styles.sep}>›</span>
            <span className={styles.cur}>The light between rooms</span>
            <Link to="/cinema" className={styles.crumbBack}>
              ← Back to slate
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <div className={styles.posterCol}>
            <div className={styles.poster}>
              <ImageSlot tint="plum" width="100%" height="100%" radius={18} placeholder="film poster · 3:4" style={{ position: 'absolute', inset: 0 }} />
              <Link to="/cinema/watch" className={styles.playFab}>
                <span className={styles.playCircle}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </span>
              </Link>
              <div className={styles.posterCaption}>Press play · trailer 1:42</div>
            </div>

            <div className={styles.tipjar}>
              <div className={styles.tipjarH}>↳ tip the filmmaker</div>
              <div className={styles.tipjarName}>
                Maria <em>Vasconcelos</em>
              </div>
              <div className={styles.tipjarSub}>100% goes to Maria. No fees skimmed.</div>
              <div className={styles.tipRow}>
                {TIPS.map((t, i) => (
                  <button
                    key={t}
                    className={[styles.tipChip, tip === i && styles.tipChipOn].filter(Boolean).join(' ')}
                    onClick={() => {
                      setTip(i)
                      if (t !== '···') showToast(`Tipped ${t} to Maria`, 'success')
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className={styles.tipFoot}>
                <strong>187 members</strong> have tipped this week.
              </div>
            </div>
          </div>

          <div>
            <div className={styles.kicker}>
              <span>Cover film · week 23</span>
              <span className={styles.dot} />
              <span className={styles.by}>Programmed by João Ribeiro</span>
            </div>
            <h1 className={styles.title}>
              The light <em>between</em> rooms
            </h1>
            <div className={styles.meta}>
              Maria Vasconcelos · Portugal, 2025 · 92 min · documentary
            </div>

            <div className={styles.curatorPull}>
              <div className={styles.cpAv}>JR</div>
              <div className={styles.cpText}>
                “A patient, generous film about Lisbon's working-class queer elders, made over three
                years in the kitchens that raised them. <em>Stay for the second hour</em> — it's
                where the film stops being about loss and starts being about teaching.”
                <span className="who">— João Ribeiro · programming lead</span>
              </div>
            </div>

            <div className={styles.watchBlock}>
              <div className={styles.wbTabs}>
                {WATCH_TABS.map((t, i) => (
                  <div
                    key={t.label}
                    className={[styles.wbTab, tab === i && styles.wbTabActive].filter(Boolean).join(' ')}
                    onClick={() => setTab(i)}
                  >
                    <span>{t.label}</span>
                    <span className={styles.tw}>{t.sub}</span>
                  </div>
                ))}
              </div>
              <div className={styles.wbActions}>
                <Button size="lg" to="/cinema/watch">
                  ▶ &nbsp;Watch full film · 1h 32m
                </Button>
                <span className={styles.iconBtn} title="Add to watchlist" onClick={() => showToast('Added to your watchlist', 'success')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className={styles.iconBtn} title="Share" onClick={() => showToast('Link copied', 'success')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx={18} cy={5} r={3} />
                    <circle cx={6} cy={12} r={3} />
                    <circle cx={18} cy={19} r={3} />
                    <line x1={8.59} y1={13.51} x2={15.42} y2={17.49} />
                    <line x1={15.41} y1={6.51} x2={8.59} y2={10.49} />
                  </svg>
                </span>
              </div>
              <div className={styles.wbSplit}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx={12} cy={12} r={10} />
                  <path d="M12 6v6l4 2" />
                </svg>
                <div>
                  When you rent at €3, <strong>€2.40 goes to Maria.</strong> €0.36 covers payment
                  processing. €0.24 covers hosting &amp; captions. The split is the same for every
                  filmmaker. <Link to="/governance">Read the deed →</Link>
                </div>
              </div>
            </div>

            <div className={styles.liveStrip}>
              <span className="live" />
              <div>
                <strong>Live Q&amp;A with Maria · Wed 10 June, 21:00 Lisbon.</strong> Co-hosted with
                Casa do Comum. <em>Live captions in EN &amp; PT.</em>
              </div>
              <Link to="/rsvp">RSVP →</Link>
            </div>

            <div className={styles.facts}>
              {FACTS.map((f) => (
                <div key={f.k} className={styles.fact}>
                  <div className="k">{f.k}</div>
                  <div className="v">
                    {f.ok && (
                      <span className="ok">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                    {f.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.body}>
        <div className={`wrap ${styles.bodyGrid}`}>
          <div>
            <div className={`${styles.block} ${styles.noteFull}`}>
              <div className={styles.nfHead}>
                <div className={styles.nfAv}>JR</div>
                <div>
                  <div className={styles.nfName}>João Ribeiro</div>
                  <div className={styles.nfRole}>Programming lead · curated for week 23</div>
                </div>
              </div>
              <div className={styles.nfBody}>
                <p>
                  I first met Maria's footage three years before this film existed. She'd been
                  recording the kitchens of her grandmother's friends — eleven older lesbian and gay
                  women in Marvila and Beato — without a project, without funding, without knowing
                  what she was looking for.
                </p>
                <p>
                  The film that came out of those three years is patient in a way most queer
                  documentary can't afford to be. There are <em>two whole minutes</em>, near minute
                  67, where the camera just stays on Dona Ilda's hands shelling broad beans.
                </p>
                <p>
                  I'm programming this for week 23 because the cinema's first job is to make space
                  for films that treat queer elders as <em>teachers</em>, not subjects. Stay for the
                  second hour.
                </p>
              </div>
            </div>

            <div className={styles.block}>
              <h2>
                The film's own <em>words</em>
              </h2>
              <div className={styles.syn}>
                <p>
                  For three years, between 2022 and 2025, the filmmaker followed eleven queer elders
                  across two Lisbon neighbourhoods — Marvila and Beato — into the kitchens that had
                  hosted their lives. <em>The light between rooms</em> is not a film about coming
                  out. It is a film about what was already there, before anyone had the word for it.
                </p>
                <p className="source">
                  — Director's statement, Cinemateca Portuguesa programme, March 2025.
                </p>
              </div>
            </div>

            <div className={styles.block}>
              <h2>
                Cast &amp; <em>crew</em>
              </h2>
              <div className={styles.ccGrid}>
                {CREW.map((person) => (
                  <div key={person.name} className={styles.ccRow}>
                    <div className={[styles.ccAv, person.tone === 'coral' ? styles.coral : person.tone === 'jade' ? styles.jade : ''].filter(Boolean).join(' ')}>
                      {person.initials}
                    </div>
                    <div>
                      <div className={styles.ccName}>{person.name}</div>
                      <div className={styles.ccRole}>{person.role}</div>
                      <div className={styles.ccTags}>
                        {person.tags.map((t) => (
                          <span key={t} className={t === 'member' ? styles.member : undefined}>
                            {t === 'member' ? 'QueerPulse member' : t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.fmCard}>
              <div className={styles.fmHead}>
                <div className={styles.fmAv}>MV</div>
                <div>
                  <div className={styles.fmName}>
                    Maria <em>Vasconcelos</em>
                  </div>
                  <div className={styles.fmRole}>Director · Lisbon</div>
                </div>
              </div>
              <div className={styles.fmBio}>
                Documentary filmmaker working in Marvila. Three years on this film; a decade on the
                relationships that made it possible. Shoots slow, listens slower.
              </div>
              <div className={styles.fmStats}>
                <div className={styles.fmStat}>
                  <span className="n"><em>3</em></span>
                  films on the cinema
                </div>
                <div className={styles.fmStat}>
                  <span className="n">€<em>4.2k</em></span>
                  earned here
                </div>
              </div>
              <div className={styles.fmActions}>
                <Button to="/profile">View profile</Button>
                <Button variant="ghost" onClick={() => showToast('Following Maria', 'success')}>
                  Follow filmmaker
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.splitBand}>
        <div className={`wrap ${styles.splitInner}`}>
          <div>
            <div className="eb">The split</div>
            <h2>
              Eighty percent of every rent goes to <em>the filmmaker.</em>
            </h2>
            <p>
              No exceptions, no tiers, no negotiated rates. The same deal for the first-time
              maker as for the festival winner. The ledger is public; the deed is binding.
            </p>
          </div>
          <div className={styles.splitBar}>
            <div className={styles.sbTitle}>€3 rent · where it goes</div>
            <div className={styles.sbAmount}>
              €<em>2.40</em> to Maria
            </div>
            <div className={styles.sbBar}>
              <div className={`${styles.sbSeg} ${styles.fm}`}>Filmmaker 80%</div>
              <div className={`${styles.sbSeg} ${styles.pay}`}>12%</div>
              <div className={`${styles.sbSeg} ${styles.host}`}>8%</div>
            </div>
            <div className={styles.sbLegend}>
              <div>
                <span className="v">€<em>2.40</em></span>
                Filmmaker
              </div>
              <div>
                <span className="v">€0.36</span>
                Payments
              </div>
              <div>
                <span className="v">€0.24</span>
                Hosting &amp; captions
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.related}>
        <div className="wrap">
          <h2>
            More from the <em>programme</em>
          </h2>
          <div className={styles.sub}>Films sharing a curator, a country, or a question.</div>
          <div className={styles.relGrid}>
            {related.map((film) => (
              <Link key={film.id} to="/film" className={styles.rf}>
                <div className={styles.rfPoster}>
                  <ImageSlot tint={film.tint} width="100%" height="100%" radius={12} placeholder="poster" style={{ position: 'absolute', inset: 0 }} />
                </div>
                <div className={styles.rfEb}>{film.format}</div>
                <div className={styles.rfTitle}>
                  {film.titlePre}
                  {film.titleEm && <em>{film.titleEm}</em>}
                  {film.titlePost}
                </div>
                <div className={styles.rfMeta}>{film.meta}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
