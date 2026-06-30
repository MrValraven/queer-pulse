import { Link } from 'react-router-dom'
import { FiMapPin } from 'react-icons/fi'
import { PageHero, PageShell } from '../../shared/components/layout'
import { Button, FadeIn, Outro, SkeletonLine } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { PARTNERS, type Region } from './partnerDetails'
import { routes } from '../../app/routeMap'
import s from './PartnersPage.module.css'

const regionClass: Record<Region, string> = { pt: s.pt!, eu: s.eu!, int: s.int! }

function PartnerCardSkeleton() {
  // Mirrors the real .card: top row (46px avatar + region badge), name, city, desc, tags, foot.
  return (
    <div className={s.card} aria-hidden>
      <div className={s.top}>
        <SkeletonLine width={46} height={46} style={{ borderRadius: 12 }} />
        <SkeletonLine width={68} height={20} style={{ borderRadius: 6 }} />
      </div>
      <div>
        <SkeletonLine width="60%" height={19} />
        <SkeletonLine width="40%" height={12.5} style={{ marginTop: 6 }} />
      </div>
      <div style={{ flex: 1 }}>
        <SkeletonLine width="100%" height={13.5} />
        <SkeletonLine width="80%" height={13.5} style={{ marginTop: 6 }} />
      </div>
      <div className={s.tags}>
        <SkeletonLine width={54} height={18} style={{ borderRadius: 6 }} />
        <SkeletonLine width={68} height={18} style={{ borderRadius: 6 }} />
      </div>
      <div className={s.foot} style={{ borderTopColor: 'transparent' }}>
        <SkeletonLine width={110} height={13} />
      </div>
    </div>
  )
}

export function PartnersPage() {
  const loading = useSimulatedLoad()

  return (
    <PageShell>
      <PageHero
        eyebrow="Partners & community"
        title={<>Community is stronger when <em>communities connect.</em></>}
        sub="QueerPulse doesn't exist in isolation. We're part of a wider network of queer organisations, communities, and spaces across Portugal and beyond."
      />

      <section className={s.interStrip}>
        <div className="wrap">
          <blockquote>
            Queer liberation is <em>intersectional,</em> or it isn't liberation at all.
          </blockquote>
          <p>Our partnerships reflect that belief. We work with organisations that centre race, disability, class, trans identity, and migrant experience alongside queerness — because the people in our community are whole people, with layered lives and layered needs.</p>
        </div>
      </section>

      <section className={s.section}>
        <div className="wrap">
          <div className={s.head}>
            <h2>
              The communities <em>we work with</em>
            </h2>
            <p>Partnerships built on shared values, not brand alignment. Each of these organisations is doing real, necessary work.</p>
          </div>
          <div className={s.grid}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <PartnerCardSkeleton key={i} />)
              : PARTNERS.map((p, i) => (
              <FadeIn key={p.name} delay={Math.min(i, 8) * 60} style={{ height: '100%' }}>
              <Link to={`${routes.partner}/${p.slug}`} className={s.card} style={{ height: '100%' }}>
                <div className={s.top}>
                  <span className={s.av} style={{ background: p.bg, color: p.color }}>
                    {p.av}
                  </span>
                  <span className={`${s.region} ${regionClass[p.region]}`}>{p.regionLabel}</span>
                </div>
                <div>
                  <div className={s.name}>{p.name}</div>
                  <div className={s.city}><FiMapPin /> {p.city}</div>
                </div>
                <div className={s.desc}>{p.desc}</div>
                <div className={s.tags}>
                  {p.tags.map((t) => (
                    <span key={t} className={s.tag}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className={s.foot}>View partnership →</div>
              </Link>
              </FadeIn>
            ))}
          </div>

          <div className={s.why}>
            <h2>
              On <em>intersectionality</em> and why it matters to us
            </h2>
            <p>QueerPulse is a professional network. We could have built it as a neutral space — focused only on career connections, deliberately agnostic about politics. We chose not to, and this is why:</p>
            <p>The people in our community are not just queer. They are queer and Black, queer and disabled, queer and migrant, queer and working-class, queer and trans. The systems that create difficulty in their lives don't operate along one axis. Neither can our response.</p>
            <p>
              <b>In practice, this means:</b> we prioritise partnerships with organisations that centre identities marginalised within queer spaces as well as outside them. We work to ensure the network doesn't replicate the exclusions of the mainstream.
            </p>
            <p>We're not perfect at this. We're trying to be honest about it.</p>
          </div>

          <div className={s.become}>
            <div>
              <h3>
                Want to <em>partner with us?</em>
              </h3>
              <p>We're selective about partnerships and take them seriously. If your organisation is doing work that aligns with our values, write to us and tell us about it.</p>
            </div>
            <Button size="lg" href="mailto:partners@queerpulse.pt">
              partners@queerpulse.pt
            </Button>
          </div>
        </div>
      </section>

      <Outro
        title={<>You don't have to navigate this <em>alone.</em></>}
        sub="QueerPulse, and the organisations we work with, exist so that you don't have to start from zero."
      >
        <Button size="lg" to={routes.requestInvite}>
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  )
}
