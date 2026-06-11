import { Link, Navigate, useParams } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { getPlace, hoursRows, type Tint } from './directoryPlaces'
import s from './DirectorySpacePage.module.css'

const CAT_LABEL: Record<string, string> = {
  food: 'Food & drink', design: 'Design & craft', health: 'Health & care',
  space: 'Spaces', culture: 'Culture', tech: 'Tech',
  grooming: 'Barbershop & salon', fitness: 'Gym & fitness',
}
const TINT: Record<Tint, string> = { coral: s.tCoral, jade: s.tJade, plum: s.tPlum }
const GCELL: Record<Tint, string> = { coral: '', jade: s.gCellJade, plum: s.gCellPlum }

const Check = () => (
  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
)
const Dash = () => (
  <svg viewBox="0 0 24 24"><line x1={5} y1={12} x2={19} y2={12} /></svg>
)

const MEMBERS_HERE = [
  { initials: 'RV', name: 'Rita V.', tint: 'jade' as Tint, when: 'Yesterday' },
  { initials: 'AK', name: 'Anika K.', tint: 'coral' as Tint, when: '2 days ago' },
  { initials: 'NA', name: 'Nuno A.', tint: 'plum' as Tint, when: '3 days ago' },
  { initials: 'SC', name: 'Sofia C.', tint: 'coral' as Tint, when: 'last week' },
]

const stars = (n: number) => '★★★★★☆☆☆☆☆'.slice(5 - n, 10 - n)

export function DirectorySpacePage() {
  const { slug } = useParams()
  const place = getPlace(slug)
  if (!place) return <Navigate to="/directory" replace />

  const words = place.name.split(' ')
  const last = words.pop()
  const lead = words.join(' ')

  const rows = hoursRows(place.hoursType)
  const todayIdx = (new Date().getDay() + 6) % 7

  const igUrl = place.social.instagram ? `https://instagram.com/${place.social.instagram.replace(/^@/, '')}` : undefined

  return (
    <PageShell>
      <div className={s.cover}>
        <div className={s.coverInner}>
          <Link to="/directory" className={s.back}>← Directory</Link>
          <div className={s.gallery}>
            {place.gallery.map((cap, i) => (
              <div key={i} className={[s.gCell, GCELL[place.tint]].join(' ')}>
                <span className={s.gCap}>{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={s.page}>
        <div className={s.grid}>
          <main>
            <header className={s.head}>
              <div className={s.eyebrow}>{CAT_LABEL[place.cat]} · {place.hood} · Lisbon</div>
              <h1 className={s.h1}>{lead && `${lead} `}<em>{last}.</em></h1>
              <p className={s.tagline}>{place.tagline}</p>
              <div className={s.pills}>
                <span className={[s.pill, place.owned ? s.verified : s.friendlyPill].join(' ')}>
                  {place.owned ? 'Verified queer-owned' : 'LGBTQ+ friendly'}
                </span>
                {place.pills.map((p) => (
                  <span key={p} className={s.pill}>{p}</span>
                ))}
              </div>
              <div className={s.ratingRow}>
                <div className={s.rating}>
                  <span className={s.stars}>{stars(Math.round(Number(place.rating.score)))}</span>
                  <b>{place.rating.score}</b>
                  <span>· {place.rating.count} reviews</span>
                </div>
              </div>
            </header>

            <section className={s.sec}>
              <h2>What it <em>actually is.</em></h2>
              {place.whatItIs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>

            <section className={s.sec}>
              <h2>What members say it's <em>good for</em></h2>
              <p className={s.subLine}>Aggregated from {place.rating.count} reviews.</p>
              <div className={s.features}>
                {place.goodFor.map((f) => (
                  <div key={f.label} className={[s.feature, !f.yes && s.featureMaybe].filter(Boolean).join(' ')}>
                    <div className={s.featureIc}>{f.yes ? <Check /> : <Dash />}</div>
                    {f.label}
                  </div>
                ))}
              </div>
            </section>

            <section className={s.sec}>
              <h2>Hours</h2>
              <p className={s.subLine}>{place.hoursNote}</p>
              {place.hoursType === 'appointment' ? (
                <div className={s.apptNote}>
                  <div className={s.featureIc}>
                    <svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><path d="M12 7v5l3 2" /></svg>
                  </div>
                  {place.hoursNote}
                </div>
              ) : (
                <div className={s.hoursTable}>
                  {rows.map((r, i) => (
                    <div key={r.day} className={[s.hoursRow, i === todayIdx && s.hoursToday, r.closed && s.hoursClosed].filter(Boolean).join(' ')}>
                      <span className={s.hoursDay}>
                        {r.day}
                        {i === todayIdx && <span className={s.todayTag}>Today</span>}
                      </span>
                      <span>{r.val}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={s.sec}>
              <h2>Member reviews · <em>{place.rating.count}</em></h2>
              <p className={s.subLine}>Sorted by most helpful.</p>
              {place.reviews.map((rev) => (
                <div key={rev.name} className={s.rev}>
                  <div className={s.revHead}>
                    <div className={[s.revAv, TINT[rev.tint]].join(' ')}>{rev.initials}</div>
                    <div>
                      <div className={s.revName}>{rev.name}</div>
                      <div className={s.revByline}>{rev.byline}</div>
                    </div>
                    <span className={s.revStars}>{stars(rev.stars)}</span>
                  </div>
                  <div className={s.revText}>{rev.text}</div>
                  <div className={s.revHelpful}><b>{rev.helpful}</b> members found this helpful</div>
                </div>
              ))}
            </section>
          </main>

          <aside className={s.side}>
            <div className={s.sideCard}>
              <div className={s.map}>
                <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  <rect width="300" height="300" fill="#e9e5db" />
                  <path d="M0 80 L300 100 L300 110 L0 90 Z" fill="#d9d3c5" />
                  <path d="M0 180 L300 200 L300 210 L0 190 Z" fill="#d9d3c5" />
                  <path d="M80 0 L100 300 L110 300 L90 0 Z" fill="#d9d3c5" />
                  <path d="M200 0 L220 300 L230 300 L210 0 Z" fill="#d9d3c5" />
                  <circle cx="160" cy="148" r="20" fill="#b8d4b1" opacity=".7" />
                </svg>
                <div className={s.pin}>
                  <svg viewBox="0 0 24 24"><path d="M12 2C7 2 3 6 3 11c0 7 9 11 9 11s9-4 9-11c0-5-4-9-9-9z" /></svg>
                </div>
              </div>
              <div className={s.addr}>
                <strong style={{ display: 'block', color: 'var(--plum)', fontFamily: 'var(--serif)', fontSize: 17, marginBottom: 3 }}>{place.name}</strong>
                {place.address}
              </div>
              {place.social.phone && (
                <div className={s.contactRow}>
                  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 8.81 19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.16.93.4 1.83.7 2.7" /></svg>
                  <a href={`tel:${place.social.phone.replace(/\s/g, '')}`}>{place.social.phone}</a>
                </div>
              )}
              {place.social.website && (
                <div className={s.contactRow}>
                  <svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={10} /><path d="M2 12h20M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20" /></svg>
                  <a href={`https://${place.social.website}`} target="_blank" rel="noopener noreferrer">{place.social.website}</a>
                </div>
              )}
              {igUrl && (
                <div className={s.contactRow}>
                  <svg viewBox="0 0 24 24"><rect x={2} y={2} width={20} height={20} rx={5} /><circle cx={12} cy={12} r={4} /><line x1={17.5} y1={6.5} x2={17.5} y2={6.5} /></svg>
                  <a href={igUrl} target="_blank" rel="noopener noreferrer">{place.social.instagram}</a>
                </div>
              )}
              {place.social.email && (
                <div className={s.contactRow}>
                  <svg viewBox="0 0 24 24"><rect x={2} y={4} width={20} height={16} rx={2} /><polyline points="22,6 12,13 2,6" /></svg>
                  <a href={`mailto:${place.social.email}`}>{place.social.email}</a>
                </div>
              )}
              <div className={s.cta}>
                {place.social.website ? (
                  <Button variant="primary" className={s.ctaBtn} href={`https://${place.social.website}`}>
                    Visit website →
                  </Button>
                ) : place.social.email ? (
                  <Button variant="primary" className={s.ctaBtn} href={`mailto:${place.social.email}`}>
                    Get in touch →
                  </Button>
                ) : null}
                <Button variant="ghost" className={s.ctaBtn} to="/directory">
                  Back to directory
                </Button>
              </div>
            </div>

            <div className={s.sideCard}>
              <h4>Who runs it</h4>
              <div className={[s.ownerAv, TINT[place.owner.tint]].join(' ')}>{place.owner.initials}</div>
              <div className={s.ownerName}>{place.owner.name}</div>
              <div className={s.ownerRole}>{place.owner.role}</div>
              <span className={[s.qpChip, place.owner.inQueerPulse ? s.qpChipYes : s.qpChipNo].join(' ')}>
                {place.owner.inQueerPulse ? 'On QueerPulse' : 'Community-vouched'}
              </span>
              <p className={s.ownerBio}>{place.owner.bio}</p>
              {place.owner.inQueerPulse && (
                <Button variant="ghost" className={s.ctaBtn} to="/profile">
                  View {place.owner.first}'s profile →
                </Button>
              )}
            </div>

            <div className={s.sideCard}>
              <h4>Members here lately</h4>
              <div className={s.whoHere}>
                {MEMBERS_HERE.map((m) => (
                  <div key={m.initials} className={s.whoRow}>
                    <span className={[s.whoAv, TINT[m.tint]].join(' ')}>{m.initials}</span>
                    <Link to="/profile">{m.name}</Link>
                    <span className={s.whoWhen}>{m.when}</span>
                  </div>
                ))}
              </div>
            </div>

            {place.upcoming && place.upcoming.length > 0 && (
              <div className={s.sideCard}>
                <h4>Upcoming here</h4>
                {place.upcoming.map((u) => (
                  <p key={u.title} className={s.upRow}>
                    <b>{u.when}</b>
                    <br />
                    {u.title}
                  </p>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </PageShell>
  )
}
