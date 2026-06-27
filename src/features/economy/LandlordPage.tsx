import { useState } from 'react'
import { FiStar } from 'react-icons/fi'
import { Link, Navigate, useParams } from 'react-router-dom'
import { routes } from '../../app/routeMap'
import { PageShell } from '../../shared/components/layout'
import { Button, FadeIn, ImageSlot } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { useToast } from '../../shared/components/feedback/useToast'
import { getLandlord, type Tint } from './landlords'
import { RecommendModal } from './HousingModals'
import { LandlordSkeleton } from './LandlordSkeleton'
import s from './LandlordPage.module.css'

const TINT: Record<Tint, string> = { coral: s.tCoral, jade: s.tJade, plum: s.tPlum }
const Stars = ({ n }: { n: number }) => (
  <>
    {Array.from({ length: 5 }, (_, i) => (
      <FiStar key={i} className={i < n ? s.starOn : undefined} />
    ))}
  </>
)

export function LandlordPage() {
  const { slug } = useParams()
  const { showToast } = useToast()
  const [recommending, setRecommending] = useState(false)
  const loading = useSimulatedLoad()

  const ll = getLandlord(slug)
  if (!ll) return <Navigate to={routes.housing} replace />

  if (loading) {
    return (
      <PageShell>
        <div className={s.page}>
          <Link to={routes.housing} className={s.back}>← Housing board</Link>
          <LandlordSkeleton />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className={s.page}>
        <Link to={routes.housing} className={s.back}>← Housing board</Link>

        <FadeIn>
        <header className={s.hero}>
          <ImageSlot
            className={s.photo}
            src={ll.photo}
            alt={ll.name}
            tint={ll.tint}
            initials={ll.initials}
            radius={16}
            width={160}
            height={160}
          />
          <div>
            <div className={s.eyebrow}>Community-endorsed landlord</div>
            <h1 className={s.name}>{ll.name}</h1>
            <div className={s.metaLine}>
              <span className={s.stars}><Stars n={Math.round(ll.stars)} /></span>
              <span>{ll.hood}</span>
            </div>
            <p className={s.tagline}>{ll.tagline}</p>
          </div>
          <div className={s.heroAction}>
            <Button variant="primary" onClick={() => setRecommending(true)}>
              Recommend {ll.name}
            </Button>
            <span className={s.recCount}>{ll.recommendations.length} member recommendations</span>
          </div>
        </header>

        <div className={s.grid}>
          <main>
            <section className={s.sec}>
              <h2>About {ll.name}</h2>
              {ll.about.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>

            <section className={s.sec}>
              <h2>Where they rent</h2>
              <div className={s.areas}>
                {ll.areas.map((a) => (
                  <div key={a} className={s.area}>
                    <div className={s.areaDot} />
                    {a}
                  </div>
                ))}
              </div>
            </section>

            <section className={s.sec}>
              <h2>Member recommendations</h2>
              <div className={s.recs}>
                {ll.recommendations.map((r) => (
                  <div key={r.name + r.when} className={s.rec}>
                    <div className={s.recHead}>
                      <div className={[s.recAv, TINT[r.tint]].join(' ')}>{r.initials}</div>
                      <div>
                        <div className={s.recName}>{r.name}</div>
                        <div className={s.recWhen}>{r.when}</div>
                      </div>
                      <span className={s.recStars}><Stars n={r.stars} /></span>
                    </div>
                    <div className={s.recText}>{r.text}</div>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <aside className={s.side}>
            <div className={s.sideCard}>
              <h4>At a glance</h4>
              {ll.stats.map((st) => (
                <div key={st.label} className={s.statRow}>
                  <span>{st.label}</span>
                  <b>
                    {st.label === 'Community rating' && <FiStar className={s.statStar} />}
                    {st.value}
                  </b>
                </div>
              ))}
            </div>

            <div className={s.recCard}>
              <h4>Rented from {ll.name}?</h4>
              <p>
                Your recommendation is what makes this list trustworthy — and what makes someone
                else's move so much safer. It takes two minutes.
              </p>
              <Button variant="ghost-dark" className={s.sideFull} onClick={() => setRecommending(true)}>
                Recommend this landlord
              </Button>
            </div>

            <div className={s.sideCard}>
              <h4>How to rent from them</h4>
              <p className={s.note}>{ll.rentingNote}</p>
              <Button
                variant="ghost"
                className={s.sideFull}
                style={{ marginTop: 14 }}
                onClick={() => showToast(`Introduction requested with ${ll.name}`, 'success')}
              >
                Request an introduction →
              </Button>
            </div>
          </aside>
        </div>
        </FadeIn>
      </div>

      {recommending && (
        <RecommendModal
          landlordName={ll.name}
          onClose={() => setRecommending(false)}
          onSubmitted={(stars) => showToast(`Recommendation submitted — ${stars} stars`, 'success')}
        />
      )}
    </PageShell>
  )
}
