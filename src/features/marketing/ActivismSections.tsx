import { Link } from 'react-router-dom'
import { FiStar } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { START_STEPS, SKILLS_CARDS, ORGS, VOLUNTEER_ROLES } from './activism.data'
import s from './ActivismPage.module.css'

export function StartSection() {
  return (
    <section className={s.section} id="start">
      <h2>Where to <em>start</em></h2>
      <p>The most common reason people don't do anything is that they don't know where to begin. But real, effective activism is almost always built from small, consistent acts rather than dramatic gestures.</p>
      <p>Start where you are. Start with what you have. A designer who makes a protest poster, a cook who feeds volunteers, a lawyer who gives an hour of free advice — these are acts of activism. They count.</p>
      <div className={s.actionGrid}>
        {START_STEPS.map((c) => (
          <div key={c.num} className={s.actionCard}>
            <div className={s.acNum}>{c.num}</div>
            <div className={s.acTitle}>{c.title}</div>
            <div className={s.acBody}>{c.body}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function LocalSection() {
  return (
    <section className={s.section} id="local">
      <h2>Local action <em>in Lisbon</em></h2>
      <p>Lisbon is a city in rapid change. Rents are rising, longtime residents are being displaced, and the queer community — historically rooted in Mouraria, Intendente, and Martim Moniz — feels this pressure directly.</p>
      <p><b>What this means in practice:</b> the fights worth fighting right now include affordable housing for LGBTQ+ people, preservation of queer cultural spaces, trans-inclusive public healthcare, and protection from workplace discrimination.</p>
      <div className={s.banner}>
        <span className={s.ibDot} />
        <div>
          <div className={s.ibHead}>Current focus — housing</div>
          <p>Several longtime queer-friendly spaces in Mouraria and Intendente face displacement. The community is helping to document, connect, and resource people affected. If you're involved in housing rights, post on the board.</p>
        </div>
      </div>
    </section>
  )
}

export function SkillsSection() {
  return (
    <section className={s.section} id="skills">
      <h2>Using your <em>skills</em></h2>
      <p>Every skill has an activist application. This isn't a metaphor — it's a practical observation about how change actually gets made:</p>
      <div className={s.actionGrid}>
        {SKILLS_CARDS.map((c) => (
          <div key={c.title} className={s.actionCard}>
            <div className={s.acNum}><FiStar /></div>
            <div className={s.acTitle}>{c.title}</div>
            <div className={s.acBody}>{c.body}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function MobiliseSection() {
  return (
    <section className={s.section} id="mobilise">
      <h2>Mobilising <em>others</em></h2>
      <p><b>Be concrete.</b> "I want to make things better for queer people in Lisbon" is true but unmobilising. "I want to get five queer artists involved in the Mouraria cultural market next October" is a goal people can act on.</p>
      <p><b>Be honest about what you need.</b> Time, skills, money, connections — say specifically what would help and what you can offer in return.</p>
      <p><b>Make participation easy and exit easier.</b> The biggest barrier to sustained involvement is feeling locked in. Build opt-outs from the start. People stay if they know they can leave.</p>
    </section>
  )
}

export function FeelSection() {
  return (
    <section className={s.section} id="feel">
      <h2>When it doesn't <em>feel like enough</em></h2>
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
  )
}

export function OrgsSection() {
  return (
    <section className={s.section} id="orgs">
      <h2>Organisations worth <em>knowing</em></h2>
      <p>These organisations are doing real work for LGBTQ+ people in Portugal. Most are looking for volunteers, skills, and support.</p>
      <div className={s.orgList}>
        {ORGS.map((o) => (
          <Link key={o.name} to="/partners" className={s.orgRow}>
            <span className={s.orgAv} style={{ background: o.bg, color: o.color }}>{o.av}</span>
            <div>
              <div className={s.orgName}>{o.name}</div>
              <div className={s.orgDesc}>{o.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function VolunteerSection() {
  return (
    <section className={s.section} id="volunteer">
      <h2>Volunteer <em>opportunities</em></h2>
      <p>Want to do more than read about it? Here are specific, open roles in Lisbon's queer community looking for people right now — no lengthy applications, no gatekeeping.</p>
      <div className={s.actionGrid}>
        {VOLUNTEER_ROLES.map((v) => (
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
        <Button variant="ghost" to="/volunteer">See all volunteer opportunities →</Button>
      </div>
    </section>
  )
}
