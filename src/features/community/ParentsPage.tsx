import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { MEETUPS, OFFERS, RESOURCES, STATS } from './parents.data'
import styles from './ParentsPage.module.css'

export function ParentsPage() {
  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <Reveal className={styles.eyebrow}>Queer Parent Network · Support</Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>
            For the families <em>often overlooked</em> in queer spaces.
          </Reveal>
          <Reveal as="p" className={styles.lead} delay={120}>
            LGBTQ+ parents, co-parents, and people navigating parenthood — biological, adoptive,
            chosen, and everything in between. A network that already knows your family makes sense.
          </Reveal>
          <Reveal className={styles.stats} delay={160}>
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className={styles.statN}>{stat.n}</div>
                <div className={styles.statL}>{stat.label}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </header>

      <section className={styles.section}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            What the network <em>actually does.</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            Less a forum, more a standing arrangement between families who help each other through
            the practical and the heavy alike.
          </Reveal>
          <div className={styles.grid}>
            {OFFERS.map((offer, index) => (
              <Reveal key={offer.title} className={styles.card} delay={index * 55}>
                <div className={styles.cardIcon}>{offer.icon}</div>
                <div className={styles.cardTitle}>{offer.title}</div>
                <div className={styles.cardBody}>{offer.body}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            Coming up <em>soon.</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            Most months bring a daytime playdate and an evening for the grown-ups. Kids welcome
            unless we say otherwise.
          </Reveal>
          <div className={styles.meetups}>
            {MEETUPS.map((meetup, index) => (
              <Reveal key={meetup.title} className={styles.meetup} delay={index * 55}>
                <div className={styles.date}>
                  <div className={styles.dateDd}>{meetup.dd}</div>
                  <div className={styles.dateMm}>{meetup.mm}</div>
                </div>
                <div className={styles.meetupBody}>
                  <div className={styles.meetupTitle}>{meetup.title}</div>
                  <div className={styles.meetupMeta}>{meetup.meta}</div>
                </div>
                <span className={styles.meetupTag}>{meetup.tag}</span>
              </Reveal>
            ))}
          </div>

          <Reveal className={styles.resList} delay={120}>
            {RESOURCES.map((resource) => (
              <Link key={resource.to} to={resource.to} className={styles.resLink}>
                {resource.title}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <Outro
        title={<>No one explains <em>their family here.</em></>}
        sub="Join the network, find your paediatrician, and let your kids run around with others who never had to wonder why."
      >
        <Button to="/community/queer-parents" variant="primary" size="lg">
          Join the network →
        </Button>
        <Button to="/calendar" variant="ghost-dark" size="lg">
          See all gatherings
        </Button>
      </Outro>
    </PageShell>
  )
}
