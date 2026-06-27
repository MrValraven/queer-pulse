import { Link, Navigate, useParams } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Avatar, FadeIn } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { routes } from '../../app/routeMap'
import { BARTERS, CATS, BADGE, getMemberInfo } from './barter.data'
import { BarterProposeCard } from './BarterProposeCard'
import { BarterDetailSkeleton } from './BarterDetailSkeleton'
import styles from './BarterDetailPage.module.css'

const STEPS: { title: string; text: string }[] = [
  { title: 'Propose', text: 'Send a message saying what you’d trade and why the swap works for you.' },
  { title: 'Agree', text: 'You shape the swap together — scope, timing, format. No money changes hands.' },
  { title: 'Exchange', text: 'You each deliver. Meet up in Lisbon or go remote, whatever suits.' },
  { title: 'Vouch', text: 'Afterwards, leave a vouch so the next person knows it went well.' },
]

const SUBLINE: Record<string, string> = {
  offering: 'On offer to the community — swap it for something they need.',
  seeking: 'Looking for this — and offering something in return.',
  both: 'Offering one thing, looking for another. Propose a swap that works for you both.',
}

export function BarterDetailPage() {
  const { id } = useParams()
  const b = BARTERS.find((x) => x.id === id)
  const loading = useSimulatedLoad()
  if (!b) return <Navigate to={routes.barter} replace />

  const info = getMemberInfo(b)
  const firstName = info.name.split(' ')[0]
  const headline = b.mode === 'seeking' ? b.want : b.offer
  const catLabel = CATS.find((c) => c.value === b.cat)?.label ?? 'Skill swap'
  const posted = b.days === 1 ? 'Today' : `${b.days} days ago`

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={routes.barter} className={styles.back}>
          ← Skill exchange
        </Link>

        {loading ? (
          <BarterDetailSkeleton />
        ) : (
          <FadeIn>
        <header className={styles.head}>
          <div className={styles.eyebrow}>
            <span className={styles.kind}>{BADGE[b.mode]}</span>
            <span className={styles.sep}>·</span>
            <span>{catLabel}</span>
            <span className={styles.sep}>·</span>
            <span>{posted}</span>
          </div>
          <h1 className={styles.h1}>{headline}</h1>
          <p className={styles.sub}>{SUBLINE[b.mode]}</p>
        </header>

        <div className={styles.provider}>
          <Avatar initials={info.initials} tint={info.tint} size={56} />
          <div>
            <div className={styles.provName}>{info.name}</div>
            <div className={styles.provRole}>{info.hood ? `${info.hood} · Lisbon` : 'Lisbon'}</div>
          </div>
          <div className={styles.provAction}>
            <span className={styles.now}>Usually replies fast</span>
            <Link to={routes.messages} className={styles.provLink}>
              Message {firstName} →
            </Link>
          </div>
        </div>

        <div className={styles.grid}>
          <main>
            {b.offer && (
              <section className={styles.sec}>
                <h2 className={styles.secTitle}>
                  What they’re <em>offering</em>
                </h2>
                <div className={`${styles.block} ${styles.offer}`}>
                  <div className={styles.blockLabel}>Offering</div>
                  <div className={styles.blockSkill}>{b.offer}</div>
                  <p className={styles.blockText}>{b.offerDetail}</p>
                </div>
              </section>
            )}

            {b.want && (
              <section className={styles.sec}>
                <h2 className={styles.secTitle}>
                  What they’re <em>looking for</em>
                </h2>
                <div className={`${styles.block} ${styles.want}`}>
                  <div className={styles.blockLabel}>Looking for</div>
                  <div className={styles.blockSkill}>{b.want}</div>
                  <p className={styles.blockText}>{b.wantDetail}</p>
                </div>
              </section>
            )}

            <section className={styles.sec}>
              <h2 className={styles.secTitle}>
                How a <em>swap works</em>
              </h2>
              <div className={styles.steps}>
                {STEPS.map((s, i) => (
                  <div key={s.title} className={styles.stepCard}>
                    <div className={styles.stepN}>
                      0<em>{i + 1}</em>
                    </div>
                    <h4>{s.title}</h4>
                    <p>{s.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <aside className={styles.side}>
            <BarterProposeCard name={info.name} firstName={firstName} />

            <div className={styles.sideCard}>
              <h4>Quick facts</h4>
              <div className={styles.infoRow}>
                <span>Type</span>
                <b>{BADGE[b.mode]}</b>
              </div>
              <div className={styles.infoRow}>
                <span>Category</span>
                <b>{catLabel}</b>
              </div>
              <div className={styles.infoRow}>
                <span>Posted</span>
                <b>{posted}</b>
              </div>
              {info.hood && (
                <div className={styles.infoRow}>
                  <span>Area</span>
                  <b>{info.hood}</b>
                </div>
              )}
            </div>

            <div className={styles.sideCard}>
              <h4>What it’s tagged</h4>
              <div className={styles.tagsRow}>
                {b.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
          </FadeIn>
        )}
      </div>
    </PageShell>
  )
}
