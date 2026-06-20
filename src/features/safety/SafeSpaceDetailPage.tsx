import { Link, Navigate, useParams } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { getSpace, type Tint, type VerifiedSpace, type RemovedSpace } from './safeSpaces'
import styles from './SafeSpaceDetailPage.module.css'

const TINT: Record<Tint, string> = { coral: styles.tCoral, jade: styles.tJade, plum: styles.tPlum }
const SAFETY = routes.safety
const VERIFIED_COUNT = 47

const Tick = () => (
  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
)

function emName(name: string) {
  const words = name.split(' ')
  const last = words.pop()
  return { lead: words.join(' '), last }
}

function VerifiedView({ s }: { s: VerifiedSpace }) {
  const { showToast } = useToast()
  const { lead, last } = emName(s.name)
  const share = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(window.location.href)
    showToast('Link copied', 'success')
  }

  return (
    <div className={styles.page}>
      <Link to="/safe-spaces" className={styles.back}>← Safe spaces</Link>

      <div className={styles.trustBanner}>
        <div className={styles.seal}><Tick /></div>
        <div>
          <h3>Verified safe space · {s.tier}</h3>
          <p>
            <b>This space meets the Safe Spaces criteria</b> and was visited by QueerPulse
            moderators in the last 12 months. Last re-verified <b>{s.reVerified}</b> · {s.verifier}.
          </p>
        </div>
      </div>

      <header className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>{s.eyebrow}</div>
          <h1 className={styles.h1}>{lead && `${lead} `}<em>{last}.</em></h1>
          <p className={styles.sub}>{s.sub}</p>
          <div className={styles.meta}>
            {s.metaPills.map((p) => (
              <span key={p.label} className={[styles.pill, p.accent && styles.pillAccent].filter(Boolean).join(' ')}>
                {p.label}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.heroImg}>{s.name}</div>
      </header>

      <div className={styles.grid}>
        <main>
          <section className={styles.sec}>
            <h2>What you can rely on, <em>here</em></h2>
            <p className={styles.secSub}>Every verified space commits to these. We check in twice a year.</p>
            <div className={styles.promises}>
              {s.promises.map((p) => (
                <div className={styles.promise} key={p.title}>
                  <div className={styles.check}><Tick /></div>
                  <div>
                    <b>{p.title}</b>
                    <span>{p.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.sec}>
            <h2>Vouched by <em>{s.vouches.length} {s.vouches.length === 1 ? 'member' : 'members'}</em></h2>
            <p className={styles.secSub}>
              Independent safety reviews from verified members.{' '}
              <button type="button" onClick={() => showToast('Vouch form opened', 'info')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--plum)', fontWeight: 600, fontSize: 14 }}>Add yours →</button>
            </p>
            <div className={styles.vouchRow}>
              {s.vouches.map((v) => (
                <div className={styles.vouch} key={v.name + v.when}>
                  <div className={styles.vouchHead}>
                    <div className={[styles.vouchAv, TINT[v.tint]].join(' ')}>{v.initials}</div>
                    <div>
                      <div className={styles.vouchName}><Link to="/members">{v.name}</Link></div>
                      <div className={styles.vouchByline}>{v.byline}</div>
                    </div>
                  </div>
                  <div className={styles.vouchText}>{v.text}</div>
                  <div className={styles.vouchWhen}>{v.when}</div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.sec}>
            <h2>If something happens <em>here</em></h2>
            <div className={styles.incident}>
              <h3>You're in immediate danger</h3>
              <p>Tell any staff member you need help leaving — verified spaces will escort you out, no questions asked. If you can, also call <b>112</b>.</p>
              <Link to={SAFETY}>Emergency guide →</Link>
            </div>
            <div className={[styles.incident, styles.incidentPlum].join(' ')}>
              <h3>Something felt off (not urgent)</h3>
              <p>Even small things matter — they're how we know when a space slips. File a quiet report; moderators read every one and the venue is told without your name attached.</p>
              <Link to={SAFETY}>File a quiet report →</Link>
            </div>
          </section>
        </main>

        <aside className={styles.side}>
          <div className={styles.sideCard}>
            <h4>Where</h4>
            <div className={styles.addr}>
              <b>{s.name}</b>
              {s.address}
            </div>
            <Button variant="ghost" className={styles.sideFull} to="/safe-spaces">
              Back to all spaces
            </Button>
          </div>

          <div className={styles.sideCard}>
            <h4>At a glance</h4>
            {s.glance.map((g) => (
              <div className={styles.sideRow} key={g.label}>
                <span>{g.label}</span>
                <b className={g.accent ? styles.accentV : undefined}>{g.value}</b>
              </div>
            ))}
          </div>

          <div className={[styles.sideCard, styles.sharePlum].join(' ')}>
            <h4>If a friend needs a place</h4>
            <p>Send them this exact page. Everything here — the promises, the vouches, the exits — is what they can rely on.</p>
            <Button variant="ghost-dark" className={styles.sideFull} onClick={share}>
              Copy link to share
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function RemovedView({ s }: { s: RemovedSpace }) {
  const { lead, last } = emName(s.name)
  return (
    <div className={styles.page}>
      <Link to="/safe-spaces" className={styles.back}>← Safe spaces</Link>

      <div className={styles.removedBanner}>
        <div className={styles.removedSeal}>
          <svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><line x1={8} y1={8} x2={16} y2={16} /><line x1={16} y1={8} x2={8} y2={16} /></svg>
        </div>
        <div className={styles.removedEyebrow}>Removed from safe spaces · {s.typeLabel} · {s.hood}</div>
        <h1 className={styles.removedTitle}>{lead && `${lead} `}<em>{last}.</em></h1>
        <p className={styles.removedReason}>{s.reason}</p>
        <div className={styles.removedMetaRow}>
          <div className={styles.removedMeta}><b>{s.removedDate}</b>Removed</div>
          <div className={styles.removedMeta}><b>{s.listedSince}</b>Listed since</div>
          <div className={styles.removedMeta}><b>{s.flags}</b>Member flags</div>
        </div>
      </div>

      <div className={styles.removedBody}>
        <main>
          <section className={styles.sec}>
            <h2>Why it was <em>removed</em></h2>
            {s.reasonLong.map((p, i) => (
              <p className={styles.reasonP} key={i}>{p}</p>
            ))}
          </section>

          <section className={styles.sec}>
            <h2>How it <em>happened</em></h2>
            <p className={styles.secSub}>Every removal follows the same steps, in the open.</p>
            <div className={styles.timeline}>
              {s.timeline.map((t, i) => (
                <div className={styles.tlItem} key={i}>
                  <div className={styles.tlDot} />
                  <div className={styles.tlDate}>{t.date}</div>
                  <div className={styles.tlEvent}>{t.event}</div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className={styles.side}>
          <div className={styles.whatNowCard}>
            <h3>What this means now</h3>
            <p>{s.whatNow}</p>
          </div>

          <div className={styles.sideCard}>
            <h4>Had an experience here?</h4>
            <div className={styles.addr} style={{ marginBottom: 12, fontSize: 13.5, color: 'var(--ink-60)' }}>
              The record stays open. If something happened to you here, telling us still helps — it informs any future re-review.
            </div>
            <Button variant="ghost" className={styles.sideFull} to={SAFETY}>
              File a report →
            </Button>
          </div>

          <div className={[styles.sideCard, styles.sharePlum].join(' ')}>
            <h4>Looking for somewhere safe?</h4>
            <p>This space is delisted, but {VERIFIED_COUNT}+ verified spaces across Lisbon are not. Find one near you.</p>
            <Button variant="ghost-dark" className={styles.sideFull} to="/safe-spaces">
              See verified spaces →
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export function SafeSpaceDetailPage() {
  const { slug } = useParams()
  const space = getSpace(slug)
  if (!space) return <Navigate to="/safe-spaces" replace />

  return (
    <PageShell>
      {space.kind === 'verified' ? <VerifiedView s={space.data} /> : <RemovedView s={space.data} />}
    </PageShell>
  )
}
