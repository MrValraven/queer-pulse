import { Link } from "react-router-dom";
import { Reveal } from "../../shared/components/ui";
import { MEETUPS, OFFERS, RESOURCES, STATS } from "./parents.data";
import styles from "./ParentNetwork.module.css";

/**
 * The "already raising kids" half of the Family & parenting hub — the Queer
 * Parent Network. Rendered as a section inside FamilyPage; the standalone
 * /parents route redirects here.
 */
export function ParentNetwork() {
  return (
    <>
      <section className={styles.section}>
        <div className="wrap">
          <Reveal className={styles.eyebrow}>
            Queer Parent Network · Already a parent?
          </Reveal>
          <Reveal as="h2" className={styles.h2} delay={60}>
            For the families <em>often overlooked</em> in queer spaces.
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={120}>
            LGBTQ+ parents, co-parents, and people navigating parenthood —
            biological, adoptive, chosen, and everything in between. Less a
            forum, more a standing arrangement between families who help each
            other through the practical and the heavy alike.
          </Reveal>
          <Reveal className={styles.stats} delay={160}>
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className={styles.statN}>{stat.n}</div>
                <div className={styles.statL}>{stat.label}</div>
              </div>
            ))}
          </Reveal>
          <div className={styles.grid} style={{ marginTop: 40 }}>
            {OFFERS.map((offer, index) => (
              <Reveal
                key={offer.title}
                className={styles.card}
                delay={index * 55}
              >
                <div className={styles.cardIcon}>
                  <offer.icon />
                </div>
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
            Most months bring a daytime playdate and an evening for the
            grown-ups. Kids welcome unless we say otherwise.
          </Reveal>
          <div className={styles.meetups}>
            {MEETUPS.map((meetup, index) => (
              <Reveal
                key={meetup.title}
                className={styles.meetup}
                delay={index * 55}
              >
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
              <Link
                key={resource.to}
                to={resource.to}
                className={styles.resLink}
              >
                {resource.title}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
