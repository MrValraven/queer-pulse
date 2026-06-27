import { PageHero, PageShell } from '../../shared/components/layout'
import { Button, Outro } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import m from './marketing.module.css'
import s from './AboutPage.module.css'

const TEAM = [
  { i: 'SF', bg: 'rgba(45,27,61,.1)', color: 'var(--plum)', name: 'Sofia Ferreira', role: 'Founder · Strategy', bio: 'Former housing rights lawyer. Community organising in Mouraria since 2018. Convinced the platform needed to exist before she knew how to build it.' },
  { i: 'DL', bg: 'rgba(74,140,111,.14)', color: 'var(--jade)', name: 'Daniel Lima', role: 'Design · Product', bio: 'Moved to Lisbon in 2020, stayed for the community. Believes the design of a space is a political act. Cares what the platform feels like at 2am.' },
  { i: 'RV', bg: 'rgba(232,119,90,.12)', color: 'var(--accent-ink)', name: 'Rute Vasconcelos', role: 'Engineering', bio: 'Open-source contributor. Built the first version in three weeks between jobs. Refuses to add dark patterns. Has strong opinions about forms.' },
  { i: 'MC', bg: 'rgba(112,80,170,.12)', color: 'var(--violet)', name: 'Mateus Costa', role: 'Community · Operations', bio: 'The person who knows everyone. Coordinates moderation, the council, and the reading groups. The platform runs because he answers his messages.' },
]

const VALUES = [
  { title: 'Small by design', text: 'QueerPulse is invite-only and will stay that way. We are not trying to grow. We are trying to be good.' },
  { title: 'Infrastructure, not entertainment', text: 'Not a social media platform. We want you to find what you need, connect with the people who can help, and go live your life.' },
  { title: 'Community owns this', text: 'The platform belongs to the people who use it. Significant decisions go to the community. The council can be removed by member vote.' },
  { title: 'No data economy', text: 'We do not sell data, run ads, or share information with third parties. Ever. Ask what data we hold and we will tell you.' },
  { title: 'Access is not earned', text: 'Sliding scale pricing for events. No paywalled features. If you can\'t contribute financially, you still belong here.' },
  { title: 'Honest about limitations', text: 'We are a small team. We make mistakes. We publish our moderation stats and finances every quarter, and fix things publicly.' },
]

const TIMELINE = [
  { date: 'Autumn 2022', title: 'The WhatsApp group', text: 'A mutual aid chat for queer people in Lisbon grows past 200 and breaks under its own weight. Someone says: "this should be a platform."' },
  { date: 'February 2023', title: 'First version launches', text: 'Built in three weeks. Profiles, a message board, a housing section. 60 members. No press — word of mouth only.' },
  { date: 'September 2023', title: 'The magazine launches', text: 'QueerPulse Magazine, Issue 1. Eight articles. No advertising. Published on the first of the month. Still is.' },
  { date: 'March 2024', title: 'Advisory council formed', text: 'The community votes in the first council. Moderation becomes accountable to a body that can be removed by member vote.' },
  { date: 'June 2024', title: 'Reading Groups begin', text: 'The first group meets in a kitchen in Mouraria. Seven of eight attendees are still members. Two became close friends.' },
  { date: 'January 2025', title: 'Mental health fund', text: 'Funded by the community and a Gulbenkian grant. Has supported 40+ members with subsidised therapy since launch.' },
  { date: 'Now', title: '247 members. Still invite-only.', text: 'We are not trying to be bigger. We are trying to be better. If you are reading this, someone thinks you belong here.' },
]

export function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About QueerPulse"
        title={<>Built in Lisbon. <em>Built for us.</em></>}
        sub="QueerPulse is a private professional network for the queer community in Lisbon. Not a social media platform. Not a startup looking for scale. A piece of infrastructure the community needed and built for itself."
      />

      <section className={m.section}>
        <div className="wrap">
          <div className={m.sectionEyebrow}>Where this started</div>
          <div className={s.originGrid}>
            <div>
              <h2 className={m.sectionTitle}>
                A WhatsApp group that <em>outgrew itself.</em>
              </h2>
              <div className={s.body}>
                <p>It started in 2022 as a group chat. Someone needed a housing recommendation. Someone else knew a trans-friendly GP. A third was looking for a flatmate who wouldn't make things weird. These conversations were already happening — informally, repeatedly, with the same core people forwarding the same information.</p>
                <p>By the end of that year, the group had over 200 people. Too many for a group chat, not enough for a platform. The right size for something specific: a small, accountable, invite-only network.</p>
                <p>QueerPulse launched in early 2023. The name came from a 3am conversation about what the community actually needs. Not visibility. Not a scene. A pulse — something steady you can check in on and find others checking in too.</p>
              </div>
            </div>
            <div className={s.pull}>We didn't want to build a startup. We wanted to build the thing that should already exist.</div>
          </div>
        </div>
      </section>

      <section className={m.section} style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className={m.sectionEyebrow}>The team</div>
          <h2 className={m.sectionTitle}>
            Four people. <em>One shared agenda.</em>
          </h2>
          <div className={s.teamGrid}>
            {TEAM.map((t) => (
              <div key={t.name} className={s.teamCard}>
                <div className={s.tcAv} style={{ background: t.bg, color: t.color }}>
                  {t.i}
                </div>
                <div className={s.tcName}>{t.name}</div>
                <div className={s.tcRole}>{t.role}</div>
                <div className={s.tcBio}>{t.bio}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={m.section} style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className={m.sectionEyebrow}>What we believe</div>
          <h2 className={m.sectionTitle}>
            Not principles. <em>Commitments.</em>
          </h2>
          <div className={s.valuesGrid}>
            {VALUES.map((v) => (
              <div key={v.title} className={s.valCard}>
                <div className={s.valTitle}>{v.title}</div>
                <div className={s.valText}>{v.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={m.section} style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className={m.sectionEyebrow}>How we got here</div>
          <h2 className={m.sectionTitle}>
            The short <em>history.</em>
          </h2>
          <div className={s.timeline}>
            {TIMELINE.map((t) => (
              <div key={t.date} className={s.tlItem}>
                <span className={s.tlDot} />
                <div className={s.tlDate}>{t.date}</div>
                <div className={s.tlTitle}>{t.title}</div>
                <div className={s.tlText}>{t.text}</div>
              </div>
            ))}
          </div>

          <div className={s.contactStrip}>
            <div className={s.csText}>
              <h3>
                Questions? <em>We answer them.</em>
              </h3>
              <p>If something on this page raised a question, or you want to understand more about how the platform works, write to us. We read everything and reply to most things.</p>
            </div>
            <div className={s.csActions}>
              <Button to={routes.contact}>Get in touch</Button>
              <Button variant="ghost" to={routes.governance}>
                Governance &amp; transparency
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Outro
        title={<>A queer network. <em>Rooted in Lisbon.</em></>}
        sub="Invite-only. Community-owned. Built to last."
      >
        <Button size="lg" to={routes.invite}>
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  )
}
