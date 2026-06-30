import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import styles from "./ArrivingPage.module.css";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { HOODS, ORGS, COMM_QUICK } from "./arrivingPage.data";
import { HEALTH, HOUSING, type InfoCard } from "./arrivingPageCards.data";

const PLATFORMS = routes.platforms;
const COMMUNITIES = routes.communities;

function InfoCards({ cards }: { cards: InfoCard[] }) {
  return (
    <div className={styles.infoGrid}>
      {cards.map((c, i) => (
        <Reveal
          as="div"
          className={styles.infoCard}
          key={c.title}
          delay={i * 55}
        >
          <div className={styles.icHead}>
            <div className={styles.icIcon} style={{ background: c.iconBg }}>
              <c.icon />
            </div>
            <div className={styles.icTitle}>{c.title}</div>
          </div>
          <p className={styles.icBody}>{c.body}</p>
          {c.link &&
            (c.link.external ? (
              <a
                href={c.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.icLink}
              >
                {c.link.label}
              </a>
            ) : (
              <Link to={c.link.href} className={styles.icLink}>
                {c.link.label}
              </Link>
            ))}
        </Reveal>
      ))}
    </div>
  );
}

export function ArrivingPage() {
  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            New to Lisbon
          </Reveal>
          <Reveal as="h1" delay={60}>
            Queer and new to Lisbon? <em>Welcome.</em>
          </Reveal>
          <Reveal as="p" delay={120}>
            This city has a lot for us — a real, rooted queer community,
            welcoming neighbourhoods, organisations doing serious work, and
            people who will genuinely help you settle in. Here's what to know
            first.
          </Reveal>
        </div>
      </div>

      <section className={`${styles.section} ${styles.alt}`}>
        <div className="wrap">
          <Reveal as="div" className={styles.eye}>
            Lisbon's neighbourhoods
          </Reveal>
          <Reveal as="h2" className={styles.h} delay={60}>
            Where queer life <em>happens.</em>
          </Reveal>
          <Reveal as="p" className={styles.intro} delay={120}>
            Lisbon doesn't have one queer neighbourhood — it has several
            pockets, each with its own character. Here's an honest guide to
            where the community is.
          </Reveal>
          <div className={styles.hoodGrid}>
            {HOODS.map((h, i) => (
              <Reveal
                as="div"
                className={styles.hoodCard}
                key={h.name}
                delay={i * 55}
              >
                <span
                  className={styles.hoodTag}
                  style={{ color: h.tagColor, background: h.tagBg }}
                >
                  {h.tag}
                </span>
                <div className={styles.hoodName}>{h.name}</div>
                <p className={styles.hoodDesc}>{h.desc}</p>
                <div className={styles.hoodNote}>{h.note}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.paper}`}>
        <div className="wrap">
          <Reveal as="div" className={styles.eye}>
            Health
          </Reveal>
          <Reveal as="h2" className={styles.h} delay={60}>
            Healthcare in Lisbon — <em>what you need to know.</em>
          </Reveal>
          <Reveal as="p" className={styles.intro} delay={120}>
            Portugal has a national health service (SNS) that you can register
            with. Trans-affirming care has improved significantly — but it takes
            knowing where to go.
          </Reveal>
          <InfoCards cards={HEALTH} />
        </div>
      </section>

      <section className={`${styles.section} ${styles.alt}`}>
        <div className="wrap">
          <Reveal as="div" className={styles.eye}>
            Housing
          </Reveal>
          <Reveal as="h2" className={styles.h} delay={60}>
            Finding a place to live — <em>honestly.</em>
          </Reveal>
          <Reveal as="p" className={styles.intro} delay={120}>
            Lisbon's housing market is expensive and competitive. Here's an
            honest picture of what to expect, and where to get help.
          </Reveal>
          <InfoCards cards={HOUSING} />
        </div>
      </section>

      <section className={`${styles.section} ${styles.paper}`}>
        <div className="wrap">
          <Reveal as="div" className={styles.eye}>
            Organisations
          </Reveal>
          <Reveal as="h2" className={styles.h} delay={60}>
            Know these <em>three first.</em>
          </Reveal>
          <Reveal as="p" className={styles.intro} delay={120}>
            These are the organisations most likely to be useful within your
            first weeks in Lisbon — for legal support, mental health, or simply
            connecting to the community.
          </Reveal>
          <div className={styles.orgList}>
            {ORGS.map((o, i) => (
              <Reveal
                as={Link}
                to={PLATFORMS}
                className={styles.org}
                key={o.name}
                delay={i * 55}
              >
                <div
                  className={styles.orgAv}
                  style={{ background: o.bg, color: o.color }}
                >
                  {o.initials}
                </div>
                <div className={styles.orgBody}>
                  <div className={styles.orgName}>{o.name}</div>
                  <p className={styles.orgDesc}>{o.desc}</p>
                  <div className={styles.orgUrl}>{o.url}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.dark}`}>
        <div className="wrap">
          <Reveal as="div" className={styles.eye}>
            Your first step
          </Reveal>
          <Reveal as="h2" className={styles.h} delay={60}>
            Come to something <em>in person.</em>
          </Reveal>
          <Reveal as="p" className={styles.intro} delay={120}>
            Everything on this page is useful. But the best thing you can do is
            show up to a gathering. Next one coming up:
          </Reveal>
          <Reveal as="div" className={styles.firstGather} delay={160}>
            <div className={styles.fgDate}>
              <span className={styles.d}>14</span>
              <span className={styles.m}>Jun</span>
            </div>
            <div className={styles.fgBody}>
              <div className={styles.fgBadge}>Portfolio Night</div>
              <h3>Designers &amp; Photographers</h3>
              <p>
                Príncipe Real · From 7pm · Casual, warm, no agenda. Bring your
                work or just yourself.
              </p>
            </div>
            <Button to={routes.gathering} variant="ghost-dark">
              I'll be there →
            </Button>
          </Reveal>
        </div>
      </section>

      <section className={`${styles.section} ${styles.alt}`}>
        <div className="wrap">
          <Reveal as="div" className={styles.eye}>
            Where to start
          </Reveal>
          <Reveal as="h2" className={styles.h} delay={60}>
            Three communities for <em>new arrivals.</em>
          </Reveal>
          <Reveal as="p" className={styles.intro} delay={120}>
            Not sure where to begin? These three communities are particularly
            welcoming to people who are new to Lisbon.
          </Reveal>
          <div className={styles.commQuick}>
            {COMM_QUICK.map((c, i) => (
              <Reveal
                as={Link}
                to={COMMUNITIES}
                className={styles.cqCard}
                key={c.name}
                delay={i * 55}
              >
                <span
                  className={styles.cqType}
                  style={{ color: c.typeColor, background: c.typeBg }}
                >
                  {c.type}
                </span>
                <div className={styles.cqName}>{c.name}</div>
                <p className={styles.cqReason}>{c.reason}</p>
              </Reveal>
            ))}
          </div>
          <Reveal as="div" className={styles.commCta} delay={120}>
            <Button to={COMMUNITIES} variant="ghost">
              Browse all communities →
            </Button>
          </Reveal>
        </div>
      </section>

      <Outro
        title={
          <>
            Ready to meet <em>the community?</em>
          </>
        }
        sub="Request an invite to QueerPulse and get access to the full network — members, gatherings, board, and everything else on this page."
      >
        <Button to={routes.requestInvite} variant="primary" size="lg">
          Request an invite →
        </Button>
      </Outro>
    </PageShell>
  );
}
