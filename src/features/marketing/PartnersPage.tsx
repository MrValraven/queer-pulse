import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import m from './marketing.module.css'
import s from './PartnersPage.module.css'

type Region = 'pt' | 'eu' | 'int'
interface Partner {
  av: string
  bg: string
  color: string
  region: Region
  regionLabel: string
  name: string
  city: string
  desc: string
  tags: string[]
}

const PARTNERS: Partner[] = [
  { av: 'IL', bg: 'rgba(74,140,111,.15)', color: 'var(--jade)', region: 'pt', regionLabel: 'Portugal', name: 'ILGA Portugal', city: 'Lisbon', desc: "Portugal's leading LGBTQ+ rights organisation. Legal support, crisis services, advocacy. Our most essential partnership — institutional knowledge and political relationships.", tags: ['Rights', 'Legal', 'Crisis support'] },
  { av: 'OD', bg: 'rgba(232,119,90,.14)', color: 'var(--accent-ink)', region: 'pt', regionLabel: 'Portugal', name: 'Opus Diversus', city: 'Lisbon', desc: 'Mental health, community support, and peer group programmes for LGBTQ+ people. A space that takes care seriously — as a political act.', tags: ['Mental health', 'Peer support'] },
  { av: 'RA', bg: 'rgba(45,27,61,.1)', color: 'var(--plum)', region: 'pt', regionLabel: 'Portugal', name: 'Rede ex aequo', city: 'Nationwide', desc: 'Youth LGBTQ+ association with groups across Portugal. Peer support, youth activism, and a strong track record of building young queer community.', tags: ['Youth', 'Peer groups'] },
  { av: 'PR', bg: 'rgba(74,140,111,.14)', color: 'var(--jade)', region: 'pt', regionLabel: 'Portugal', name: 'Panteras Rosa', city: 'Lisbon', desc: 'Trans rights activism, political organising, and community visibility. The people doing the harder, slower, legislative work that enables everything else.', tags: ['Trans rights', 'Activism'] },
  { av: 'QN', bg: 'rgba(232,119,90,.12)', color: 'var(--accent-ink)', region: 'eu', regionLabel: 'Europe', name: 'Queer Nation Madrid', city: 'Madrid', desc: 'A sister network to QueerPulse — queer professional community in Madrid with whom we share events, members, and the occasional borrowed studio. Iberian solidarity.', tags: ['Network', 'Sister city'] },
  { av: 'SB', bg: 'rgba(45,27,61,.08)', color: 'var(--plum)', region: 'eu', regionLabel: 'Europe', name: 'Stonewall Berlin', city: 'Berlin', desc: 'Community network and cultural organisation in Berlin. We collaborate on exchange programmes for members travelling between the cities.', tags: ['Cultural exchange', 'Network'] },
  { av: 'AC', bg: 'rgba(74,140,111,.12)', color: 'var(--jade)', region: 'int', regionLabel: 'International', name: 'African Queer Creatives', city: 'Nairobi / London', desc: 'Network supporting queer creatives of African origin globally. A reminder that the queer experience is not Western, and that solidarity requires listening.', tags: ['African diaspora', 'Creatives'] },
  { av: 'QM', bg: 'rgba(232,119,90,.1)', color: 'var(--accent-ink)', region: 'eu', regionLabel: 'Europe', name: 'Queer Migrants Portugal', city: 'Lisbon', desc: 'Support and advocacy for LGBTQ+ migrants and refugees navigating the Portuguese immigration system. We refer members to them, they refer people to us.', tags: ['Migration', 'Refugees'] },
]

const regionClass: Record<Region, string> = { pt: s.pt, eu: s.eu, int: s.int }

export function PartnersPage() {
  return (
    <PageShell>
      <header className={m.hero}>
        <div className="wrap">
          <div className={m.eyebrow}>Partners &amp; community</div>
          <h1 className={m.heroTitle}>
            Community is stronger when <em>communities connect.</em>
          </h1>
          <p className={m.heroSub}>QueerPulse doesn't exist in isolation. We're part of a wider network of queer organisations, communities, and spaces across Portugal and beyond.</p>
        </div>
      </header>

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
              <a key={p.name} href="#" className={s.card}>
                <div className={s.top}>
                  <span className={s.av} style={{ background: p.bg, color: p.color }}>
                    {p.av}
                  </span>
                  <span className={`${s.region} ${regionClass[p.region]}`}>{p.regionLabel}</span>
                </div>
                <div>
                  <div className={s.name}>{p.name}</div>
                  <div className={s.city}>📍 {p.city}</div>
                </div>
                <div className={s.desc}>{p.desc}</div>
                <div className={s.tags}>
                  {p.tags.map((t) => (
                    <span key={t} className={s.tag}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className={s.foot}>Visit {p.name} →</div>
              </a>
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

      <section className={m.outro}>
        <div className="wrap">
          <h2>
            You don't have to navigate this <em>alone.</em>
          </h2>
          <p>QueerPulse, and the organisations we work with, exist so that you don't have to start from zero.</p>
          <Button size="lg" to="/invite">
            Request an invite
          </Button>
        </div>
      </section>
    </PageShell>
  )
}
