import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { FEATURED, HOODS, WAYS } from "./gatheringsPage.data";
import styles from "./GatheringsPage.module.css";

export function GatheringsPage() {
  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <Reveal className={styles.eyebrow}>Gatherings</Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>
            The community, <em>in the same room.</em>
          </Reveal>
          <Reveal as="p" className={styles.lead} delay={120}>
            Supper clubs, mixers, studio visits, screenings, and skill swaps —
            real-world gatherings across Lisbon, hosted by members for members.
            This is where the platform stops being a screen.
          </Reveal>
          <Reveal className={styles.hoods} delay={160}>
            {HOODS.map((hood) => (
              <span key={hood} className={styles.hood}>
                {hood}
              </span>
            ))}
          </Reveal>
        </div>
      </header>

      <section className={styles.section}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            Find your way <em>in.</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            Whether you're turning up for the first time or hosting your tenth
            supper club, start here.
          </Reveal>
          <div className={styles.grid}>
            {WAYS.map((way, index) => (
              <Reveal
                key={way.title}
                className={styles.wayCard}
                delay={index * 55}
              >
                <div className={styles.wayIcon}>
                  <way.icon />
                </div>
                <div className={styles.wayTitle}>{way.title}</div>
                <div className={styles.wayBody}>{way.body}</div>
                <Link to={way.to} className={styles.wayLink}>
                  {way.cta} →
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            Happening <em>soon.</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            A taste of the next few weeks. The full board lives on the events
            page.
          </Reveal>
          <div className={styles.events}>
            {FEATURED.map((event, index) => (
              <Reveal
                key={event.title}
                as={Link}
                to={event.to}
                className={styles.event}
                delay={index * 55}
              >
                <div className={styles.date}>
                  <div className={styles.dateDd}>{event.dd}</div>
                  <div className={styles.dateMm}>{event.mm}</div>
                </div>
                <div className={styles.eventBody}>
                  <div className={styles.eventType}>{event.type}</div>
                  <div className={styles.eventTitle}>{event.title}</div>
                  <div className={styles.eventMeta}>{event.hood}</div>
                </div>
                <span className={styles.eventSpots}>{event.spots}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <>
            Bring people <em>together.</em>
          </>
        }
        sub="Every gathering started with one member deciding to host. The platform handles the rest — tickets, sliding scale, and a listing on the board."
      >
        <Button to={routes.events} variant="primary" size="lg">
          Browse all events
        </Button>
        <Button to={routes.host} variant="ghost-dark" size="lg">
          Host a gathering
        </Button>
      </Outro>
    </PageShell>
  );
}
