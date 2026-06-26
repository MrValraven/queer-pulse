import { Link } from 'react-router-dom'
import { FiMapPin } from 'react-icons/fi'
import { PageHero, PageShell } from '../../shared/components/layout'
import { Button, Outro } from '../../shared/components/ui'
import { PARTNERS, type Region } from './partnerDetails'
import s from './PartnersPage.module.css'

const regionClass: Record<Region, string> = { pt: s.pt, eu: s.eu, int: s.int }

export function PartnersPage() {
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
            {PARTNERS.map((p) => (
              <Link key={p.name} to={`/partner/${p.slug}`} className={s.card}>
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
        <Button size="lg" to="/invite">
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  )
}
