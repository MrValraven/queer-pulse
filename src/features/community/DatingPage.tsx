import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { APPS, CULTURE, EVENTS, RECOGNITION, STRUCTURES } from "./dating.data";
import { DatingAppCard } from "./DatingAppCard";
import styles from "./DatingPage.module.css";

export function DatingPage() {
  const calendar = routes.calendar;
  const forum = routes.forum;
  const legal = routes.legal;

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Dating &amp; Relationships · Lisbon</div>
          <h1>
            Connection, <em>on your own terms.</em>
          </h1>
          <p className={styles.heroSub}>
            The app landscape, dating culture in Lisbon, relationship
            structures, legal recognition — and where the community actually
            meets when it's not on a phone screen.
          </p>
        </div>
      </div>

      <section className={styles.sec}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Apps in <em>Lisbon</em>
            </h2>
            <p>
              What the community actually uses — honest takes, not marketing
              copy.
            </p>
          </div>
          <div className={styles.appGrid}>
            {APPS.map((app) => (
              <DatingAppCard app={app} key={app.name} />
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.sec} ${styles.alt}`}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Dating culture <em>in Lisbon</em>
            </h2>
            <p>
              Things the community wishes someone had told them before they
              started dating here.
            </p>
          </div>
          <div className={styles.cultureGrid}>
            {CULTURE.map((c) => (
              <div className={styles.cultureCard} key={c.num}>
                <div className={styles.ccNum}>{c.num}</div>
                <div>
                  <div className={styles.ccTitle}>{c.title}</div>
                  <div className={styles.ccText}>{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sec}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Relationship <em>structures</em>
            </h2>
            <p>
              Lisbon has an active, visible community across all relationship
              structures. No default assumed here.
            </p>
          </div>
          <div className={styles.structuresGrid}>
            {STRUCTURES.map((s) => (
              <div className={styles.structureCard} key={s.label}>
                <div className={styles.scLabel}>{s.label}</div>
                <div className={styles.scTitle}>{s.title}</div>
                <div className={styles.scText}>{s.text}</div>
              </div>
            ))}
          </div>

          <h3 className={styles.recHead}>
            Legal <em>recognition in Portugal</em>
          </h3>
          <div className={styles.recStrip}>
            {RECOGNITION.map((r) => (
              <div className={styles.recItem} key={r.title}>
                <h4>{r.title}</h4>
                <p>{r.text}</p>
                <div
                  className={[
                    styles.recStatus,
                    r.partial ? styles.recPartial : styles.recYes,
                  ].join(" ")}
                >
                  <span
                    className={styles.recDot}
                    style={{
                      background: r.partial ? "var(--accent)" : "var(--jade)",
                    }}
                  />
                  {r.status}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.recCta}>
            <Button to={legal} variant="ghost">
              Legal advice for relationships →
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.social}>
        <div className="wrap">
          <div className={styles.socialInner}>
            <div className={styles.socialLeft}>
              <h2>
                Meet people <em>in person.</em>
              </h2>
              <p>
                Apps are fine. But the QueerPulse community tends to actually
                meet at events — socials, dinners, gatherings specifically for
                connection. Less transactional than a dating app; more honest
                about what you're there for.
              </p>
              <div className={styles.socialActions}>
                <Button to={calendar} variant="primary">
                  See upcoming events
                </Button>
                <Button to={forum} variant="ghost-dark">
                  Social forum thread →
                </Button>
              </div>
            </div>
            <div className={styles.socialEvents}>
              {EVENTS.map((e) => (
                <div className={styles.socialEvent} key={e.name}>
                  <div className={styles.seName}>{e.name}</div>
                  <div className={styles.seDetail}>{e.detail}</div>
                  <div className={styles.seNote}>{e.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Outro
        title={
          <>
            Real connection <em>exists here.</em>
          </>
        }
        sub="It takes a little time and a little showing up. The community makes it easier."
      >
        <Button to={calendar} variant="primary" size="lg">
          See what's on →
        </Button>
      </Outro>
    </PageShell>
  );
}
