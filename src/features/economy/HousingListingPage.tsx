import { useState } from 'react'
import { FiMapPin } from 'react-icons/fi'
import { Link, Navigate, useParams } from 'react-router-dom'
import { routes } from '../../app/routeMap'
import { PageShell } from '../../shared/components/layout'
import { Avatar, Button, FadeIn } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { getListing, HOUSING_LISTINGS, type Tint } from './housingListings'
import { MessageModal } from './HousingModals'
import { HousingListingSkeleton } from './HousingListingSkeleton'
import s from './HousingListingPage.module.css'

const GAL_BG: Record<Tint, string> = {
  coral: 'rgba(var(--accent-rgb),.12)',
  jade: 'rgba(var(--jade-rgb),.12)',
  plum: 'rgba(var(--plum-rgb),.08)',
}

export function HousingListingPage() {
  const { slug } = useParams()
  const [messaging, setMessaging] = useState(false)
  const loading = useSimulatedLoad()

  const l = getListing(slug)
  if (!l) return <Navigate to={routes.housing} replace />

  if (loading) {
    return (
      <PageShell>
        <div className={s.page}>
          <Link to={routes.housing} className={s.back}>← Housing board</Link>
          <HousingListingSkeleton />
        </div>
      </PageShell>
    )
  }

  const first = l.poster.fullName.split(' ')[0]
  const similar = HOUSING_LISTINGS.filter((x) => x.slug !== l.slug).slice(0, 3)

  return (
    <PageShell>
      <div className={s.page}>
        <Link to={routes.housing} className={s.back}>← Housing board</Link>

        <FadeIn>
        <div className={s.gallery}>
          {l.gallery.map((cap, i) => (
            <div key={i} className={s.gCell} style={{ background: GAL_BG[l.tint] }}>
              <span className={s.gCap}>{cap}</span>
            </div>
          ))}
        </div>

        <header className={s.head}>
          <span className={s.type} style={{ background: l.typeColor, color: l.typeText }}>
            {l.typeLabel}
          </span>
          <h1 className={s.title}>{l.title}</h1>
          <div className={s.metaRow}>
            <span className={s.metaPill}><FiMapPin /> {l.hood}</span>
            <span className={s.metaPill}>{l.beds}</span>
            <span className={s.metaPill}>From {l.avail}</span>
            <span className={s.metaPill}>{l.price} / {l.period}</span>
          </div>
        </header>

        <div className={s.grid}>
          <main>
            <section className={s.sec}>
              <h2>About this place</h2>
              {l.longDesc.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>

            <section className={s.sec}>
              <h2>Features</h2>
              <div className={s.features}>
                {l.features.map((f) => (
                  <span key={f} className={s.feature}>{f}</span>
                ))}
              </div>
            </section>

            <section className={s.sec}>
              <h2>The facts</h2>
              <div className={s.facts}>
                {l.facts.map((f) => (
                  <div key={f.label} className={s.factRow}>
                    <span>{f.label}</span>
                    <b>{f.value}</b>
                  </div>
                ))}
              </div>
            </section>

            <section className={s.sec}>
              <h2>Ideal for</h2>
              <div className={s.bullets}>
                {l.idealFor.map((b) => (
                  <div key={b} className={s.bullet}>
                    <div className={s.bulletDot} />
                    {b}
                  </div>
                ))}
              </div>
            </section>
          </main>

          <aside className={s.side}>
            <div className={s.priceCard}>
              <div className={s.priceBig}>
                {l.price} <span>/ {l.period}</span>
              </div>
              <div className={s.priceMeta}>Available from {l.avail} · posted by a verified member</div>
              <Button variant="ghost-dark" className={s.priceBtn} onClick={() => setMessaging(true)}>
                Message {first} →
              </Button>
            </div>

            <div className={s.sideCard}>
              <h4>Listed by</h4>
              <div className={s.lister}>
                <Avatar initials={l.poster.initials} tint={l.poster.tint} size={44} />
                <div>
                  <div className={s.listerName}>{l.poster.fullName}</div>
                  <div className={s.listerSince}>{l.poster.memberSince}</div>
                </div>
              </div>
              <span className={s.verifiedRow}>Verified member</span>
              <p className={s.listerBio}>{l.poster.bio}</p>
              <div className={s.replyRow}>
                Usually replies <b>{l.poster.responseTime}</b>
              </div>
              <Button variant="primary" className={s.sideFull} onClick={() => setMessaging(true)}>
                Message {first}
              </Button>
            </div>

            <div className={s.sideCard}>
              <h4>Stay safe</h4>
              <div className={s.safety}>
                <b>Never pay a deposit before viewing in person.</b> Keep the conversation on
                QueerPulse until you've met. If something feels off, the Queer Housing Justice
                Network can advise.
              </div>
            </div>

            <div className={s.sideCard}>
              <h4>More on the board</h4>
              <div className={s.more}>
                {similar.map((x) => (
                  <Link key={x.slug} to={`${routes.housing}/${x.slug}`} className={s.moreItem}>
                    <div className={s.moreThumb} style={{ background: GAL_BG[x.tint] }} />
                    <div>
                      <div className={s.moreName}>{x.title}</div>
                      <div className={s.morePrice}>{x.price} / {x.period} · {x.hood}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
        </FadeIn>
      </div>

      {messaging && (
        <MessageModal
          toName={l.poster.fullName}
          listingTitle={l.title}
          responseTime={l.poster.responseTime}
          onClose={() => setMessaging(false)}
        />
      )}
    </PageShell>
  )
}
