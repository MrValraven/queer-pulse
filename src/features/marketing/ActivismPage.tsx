import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import m from './marketing.module.css'
import s from './ActivismPage.module.css'

const NAV = [
  { id: 'start', label: 'Where to start' },
  { id: 'local', label: 'Local action in Lisbon' },
  { id: 'skills', label: 'Using your skills' },
  { id: 'mobilise', label: 'Mobilising others' },
  { id: 'feel', label: "When it's not enough" },
  { id: 'orgs', label: 'Organisations to know' },
  { id: 'volunteer', label: 'Volunteer opportunities' },
]

const START = [
  { num: '01', title: 'Identify one thing that bothers you', body: "Not everything. One thing — in your neighbourhood, your industry, your building. That's where you start. The scope is manageable, the knowledge is yours." },
  { num: '02', title: 'Find one other person who cares', body: 'Solo action burns out faster. Find someone — on the board, at a gathering, through the network. Two people is enough to start.' },
  { num: '03', title: 'Use your skills, not just your time', body: "The most sustainable activism uses what you're already good at. A photographer, a writer, a developer, a therapist — your profession is already political." },
  { num: '04', title: 'Do something small and finish it', body: 'A finished small thing beats an unfinished ambitious one every time. Show up to one meeting. Write one email. Build the muscle before the marathon.' },
]

const SKILLS = [
  { title: 'Design & visual communication', body: 'Posters, identity systems for community organisations, accessible information design. Your craft is disproportionately valuable to underfunded causes.' },
  { title: 'Technology', body: 'Websites, databases, tools. Most community organisations run on systems years out of date. A few hours of your skills can have an outsized impact.' },
  { title: 'Food & hospitality', body: 'Feed people at community events. Run a pay-what-you-can dinner. The act of nourishing people in a safe space is never neutral.' },
  { title: 'Care & therapy', body: 'Offer sliding-scale or pro-bono sessions. Run a support group. Peer support is one of the most impactful things a trained professional can do.' },
]

const ORGS = [
  { av: 'IL', bg: 'rgba(74,140,111,.12)', color: 'var(--jade)', name: 'ILGA Portugal', desc: "Portugal's leading LGBTQ+ rights organisation. Legal support, advocacy, crisis line, community programming. Volunteers always welcome." },
  { av: 'OD', bg: 'rgba(232,119,90,.1)', color: 'var(--accent-ink)', name: 'Opus Diversus', desc: 'Mental health and peer support. Run regular training for allies and professionals who want to improve their practice.' },
  { av: 'RA', bg: 'rgba(45,27,61,.08)', color: 'var(--plum)', name: 'Rede ex aequo', desc: 'Youth-focused LGBTQ+ association. Peer support, advocacy for young people, and local groups across Portugal including Lisbon.' },
  { av: 'PR', bg: 'rgba(74,140,111,.1)', color: 'var(--jade)', name: 'Panteras Rosa', desc: 'Trans rights activism and advocacy. Political campaigning and community organising with a focus on trans visibility.' },
]

const VOL = [
  { title: 'Community Outreach', pill: '2–4 hrs/wk', body: 'ILGA Portugal · Help connect community members with services and resources at events and outreach sessions across the city.' },
  { title: 'Peer Support Volunteer', pill: '4 hrs/wk', body: 'Opus Diversus · Training provided. Support people through peer-led mental health conversations. Care and a willingness to listen is enough.' },
  { title: 'Campaign Communications', pill: 'Flexible', body: 'Panteras Rosa · Writing, design, or social media for trans rights campaigns. Remote-friendly. Bring whatever skill you have.' },
  { title: 'Housing Advocate', pill: '2–3 hrs/wk', body: 'Queer Housing Justice Network · Support queer residents navigating eviction challenges in Mouraria and Intendente.' },
]

export function ActivismPage() {
  const [active, setActive] = useState('start')

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 140
      for (const { id } of NAV) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= y && el.offsetTop + el.offsetHeight > y) {
          setActive(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <PageShell>
      <header className={`${m.hero} ${m.heroPlum}`}>
        <div className="wrap">
          <div className={m.eyebrow}>Activism &amp; community action</div>
          <h1 className={m.heroTitle}>
            Your activism <em>matters</em> — even when it doesn't feel like it.
          </h1>
          <p className={m.heroSub}>Community action is not just for full-time activists. It's for the person who shows up, who uses their skills, who makes their neighbourhood a little better. This page is for you.</p>
          <div className={s.conviction}>
            {[
              { n: 'Local', l: 'impact is underrated. Your neighbourhood, your building, your industry — all of it counts.' },
              { n: 'Real', l: 'change is made by people with day jobs who do something on their lunch break or after work.' },
              { n: 'Yours', l: "to define. Activism doesn't look one way. Find the version that fits who you are." },
            ].map((c) => (
              <div key={c.n} className={s.convItem}>
                <div className="n" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 26, color: 'var(--accent)', marginBottom: 6 }}>
                  {c.n}
                </div>
                <div style={{ fontSize: 14, color: 'rgba(247,243,238,.7)', lineHeight: 1.55 }}>{c.l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className={s.layout}>
          <nav className={s.nav}>
            <div className={s.navLabel}>On this page</div>
            {NAV.map((item) => (
              <a key={item.id} href={`#${item.id}`} className={[s.navItem, active === item.id && s.navItemActive].filter(Boolean).join(' ')}>
                {item.label}
              </a>
            ))}
          </nav>

          <div>
            <section className={s.section} id="start">
              <h2>
                Where to <em>start</em>
              </h2>
              <p>The most common reason people don't do anything is that they don't know where to begin. But real, effective activism is almost always built from small, consistent acts rather than dramatic gestures.</p>
              <p>Start where you are. Start with what you have. A designer who makes a protest poster, a cook who feeds volunteers, a lawyer who gives an hour of free advice — these are acts of activism. They count.</p>
              <div className={s.actionGrid}>
                {START.map((c) => (
                  <div key={c.num} className={s.actionCard}>
                    <div className={s.acNum}>{c.num}</div>
                    <div className={s.acTitle}>{c.title}</div>
                    <div className={s.acBody}>{c.body}</div>
                  </div>
                ))}
              </div>
            </section>
            <hr className={s.divider} />

            <section className={s.section} id="local">
              <h2>
                Local action <em>in Lisbon</em>
              </h2>
              <p>Lisbon is a city in rapid change. Rents are rising, longtime residents are being displaced, and the queer community — historically rooted in Mouraria, Intendente, and Martim Moniz — feels this pressure directly.</p>
              <p>
                <b>What this means in practice:</b> the fights worth fighting right now include affordable housing for LGBTQ+ people, preservation of queer cultural spaces, trans-inclusive public healthcare, and protection from workplace discrimination.
              </p>
              <div className={s.banner}>
                <span className={s.ibDot} />
                <div>
                  <div className={s.ibHead}>Current focus — housing</div>
                  <p>Several longtime queer-friendly spaces in Mouraria and Intendente face displacement. The community is helping to document, connect, and resource people affected. If you're involved in housing rights, post on the board.</p>
                </div>
              </div>
            </section>
            <hr className={s.divider} />

            <section className={s.section} id="skills">
              <h2>
                Using your <em>skills</em>
              </h2>
              <p>Every skill has an activist application. This isn't a metaphor — it's a practical observation about how change actually gets made:</p>
              <div className={s.actionGrid}>
                {SKILLS.map((c) => (
                  <div key={c.title} className={s.actionCard}>
                    <div className={s.acNum}>✦</div>
                    <div className={s.acTitle}>{c.title}</div>
                    <div className={s.acBody}>{c.body}</div>
                  </div>
                ))}
              </div>
            </section>
            <hr className={s.divider} />

            <section className={s.section} id="mobilise">
              <h2>
                Mobilising <em>others</em>
              </h2>
              <p>
                <b>Be concrete.</b> "I want to make things better for queer people in Lisbon" is true but unmobilising. "I want to get five queer artists involved in the Mouraria cultural market next October" is a goal people can act on.
              </p>
              <p>
                <b>Be honest about what you need.</b> Time, skills, money, connections — say specifically what would help and what you can offer in return.
              </p>
              <p>
                <b>Make participation easy and exit easier.</b> The biggest barrier to sustained involvement is feeling locked in. Build opt-outs from the start. People stay if they know they can leave.
              </p>
            </section>
            <hr className={s.divider} />

            <section className={s.section} id="feel">
              <h2>
                When it doesn't <em>feel like enough</em>
              </h2>
              <p>It often doesn't. That's not a sign you're doing it wrong — it's a sign you care about things that are genuinely hard and slow-moving. Activism is a long game.</p>
              <p>Find other people doing it and stay connected. Measure yourself against "did I do something useful this month" rather than "did I change the world." Allow yourself to step back. Burnout serves no one.</p>
              <div className={`${s.banner} ${s.bannerCoral}`}>
                <span className={s.ibDot} />
                <div>
                  <div className={s.ibHead}>On self-care without the cliché</div>
                  <p>The queer community has historically taken care of itself because it had to. That mutual care — checking on people, sharing resources, making sure no one is alone in a crisis — is activism too.</p>
                </div>
              </div>
            </section>
            <hr className={s.divider} />

            <section className={s.section} id="orgs">
              <h2>
                Organisations worth <em>knowing</em>
              </h2>
              <p>These organisations are doing real work for LGBTQ+ people in Portugal. Most are looking for volunteers, skills, and support.</p>
              <div className={s.orgList}>
                {ORGS.map((o) => (
                  <Link key={o.name} to="/partners" className={s.orgRow}>
                    <span className={s.orgAv} style={{ background: o.bg, color: o.color }}>
                      {o.av}
                    </span>
                    <div>
                      <div className={s.orgName}>{o.name}</div>
                      <div className={s.orgDesc}>{o.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
            <hr className={s.divider} />

            <section className={s.section} id="volunteer">
              <h2>
                Volunteer <em>opportunities</em>
              </h2>
              <p>Want to do more than read about it? Here are specific, open roles in Lisbon's queer community looking for people right now — no lengthy applications, no gatekeeping.</p>
              <div className={s.actionGrid}>
                {VOL.map((v) => (
                  <Link key={v.title} to="/volunteer" className={s.actionCard}>
                    <div className={s.acHead}>
                      <div className={s.acTitle}>{v.title}</div>
                      <span className={s.acPill}>{v.pill}</span>
                    </div>
                    <div className={s.acBody}>{v.body}</div>
                    <span className={s.acLink}>Express interest →</span>
                  </Link>
                ))}
              </div>
              <div style={{ marginTop: 28 }}>
                <Button variant="ghost" to="/volunteer">
                  See all volunteer opportunities →
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
