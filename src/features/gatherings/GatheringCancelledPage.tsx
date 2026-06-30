import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import styles from "./GatheringCancelledPage.module.css";

const CALENDAR = routes.calendar;
const GATHERING = routes.gathering;
const MESSAGES = routes.messages;

const Tick = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ALTS = [
  {
    primary: true,
    d: "19",
    m: "Jul",
    title: (
      <>
        Studio visit · <em>Atelier Pulso · July</em>
      </>
    ),
    meta: "Largo do Carmo · 14:00 · same host · new press!",
    spots: <b>RSVPs open</b>,
  },
  {
    primary: false,
    d: "22",
    m: "Jun",
    title: (
      <>
        Sunday risograph workshop — <em>Bairro Alto</em>
      </>
    ),
    meta: "Editora Anjos · 11:00 · open to 8 people",
    spots: (
      <>
        <b>3 spots</b> left
      </>
    ),
  },
  {
    primary: false,
    d: "28",
    m: "Jun",
    title: (
      <>
        Portfolio night — <em>creatives only</em>
      </>
    ),
    meta: "Café Beirão back room · 18:00 · informal",
    spots: (
      <>
        <b>11 spots</b> left
      </>
    ),
  },
];

export function GatheringCancelledPage() {
  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={CALENDAR} className={styles.back}>
          ← Back to calendar
        </Link>

        <div className={styles.stamp}>
          <div className={styles.stampIc}>
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <div>
            <h2>This event has been cancelled.</h2>
            <p>
              Host illness · cancelled <b>4 hours ago</b>. You were on the list
              — here's everything that happens next.
            </p>
          </div>
        </div>

        <div className={styles.eventCard}>
          <div className={styles.eventH}>
            <div className={styles.eventDate}>
              <div className="d">21</div>
              <div className="m">Jun</div>
            </div>
            <div className={styles.eventInfo}>
              <h2>
                Studio visit · <em>Atelier Pulso open hours.</em>
              </h2>
              <div className={styles.eventMeta}>
                <span>Sat 14:00 — 17:00</span>
                <span className={styles.dot} />
                <span>Largo do Carmo · Lisbon</span>
                <span className={styles.dot} />
                <span>Hosted by Marta Reis</span>
              </div>
            </div>
          </div>
          <div className={styles.explainer}>
            <h3>Why it was cancelled</h3>
            <p>
              Marta is out sick — she dropped us a message yesterday and we
              waited 24h hoping a co-host could step in.{" "}
              <em>Nobody available this week.</em> We're not rescheduling
              immediately because the studio's painting work starts Monday, but
              the next visit is already on the calendar for <b>19 July</b>.
            </p>
          </div>
          <div className={styles.host}>
            <div className={styles.hostAv}>MR</div>
            <div className={styles.hostText}>
              <b>Marta Reis</b> · host · sent the cancellation
            </div>
            <Link to={MESSAGES} className={styles.hostLink}>
              Send well-wishes →
            </Link>
          </div>
        </div>

        <div className={styles.info}>
          <h3>
            What happens <em>for you</em>
          </h3>
          <div className={styles.infoRow}>
            <div className={styles.infoIc}>
              <Tick />
            </div>
            <div>
              <b>Your €5 ticket is refunded — automatically</b>
              <span>
                Refunded to Visa ending 4729 within 3–5 business days.
              </span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoIc}>
              <Tick />
            </div>
            <div>
              <b>You've been removed from the headcount</b>
              <span>
                The studio knew exactly who was coming. Nothing else to do.
              </span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoIc}>
              <Tick />
            </div>
            <div>
              <b>July visit is open for RSVPs</b>
              <span>
                You can lock in 19 July right now — Marta usually opens it
                later, but we're early because of this.{" "}
                <a href="#july">Skip to it ↓</a>
              </span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={`${styles.infoIc} ${styles.infoIcAccent}`}>
              <svg viewBox="0 0 24 24">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div>
              <b>Something feels off?</b>
              <span>
                If you have concerns about the cancellation or want to flag a
                pattern, talk to the team →
              </span>
            </div>
          </div>
        </div>

        <div className={styles.noteCard}>
          <div className={styles.noteEyebrow}>A short note · from Marta</div>
          <h3>
            "I'm so sorry, especially to the three of you{" "}
            <em>who travelled in.</em>"
          </h3>
          <p>
            It's a chest cold and not anything dramatic, but I lose my voice the
            moment I try to talk for more than ten minutes — and a studio visit
            where I can't talk is a tour, not a visit.
          </p>
          <p>
            July 19 will happen. The painting is done by then and we'll have the
            new riso press set up. Promise.
          </p>
          <div className={styles.noteSign}>
            — <b>Marta</b> · sent 4 hours ago via the host tools
          </div>
        </div>

        <div className={styles.altH} id="july">
          Next visit, or — something else this weekend
        </div>
        <div className={styles.altGrid}>
          {ALTS.map((a, i) => (
            <Link
              to={GATHERING}
              className={[styles.altRow, a.primary && styles.altRowPrimary]
                .filter(Boolean)
                .join(" ")}
              key={i}
            >
              <div className={styles.altDate}>
                <div className="d">{a.d}</div>
                <div className="m">{a.m}</div>
              </div>
              <div>
                <div className={styles.altTitle}>{a.title}</div>
                <div className={styles.altMeta}>{a.meta}</div>
              </div>
              <div className={styles.altSpots}>{a.spots}</div>
            </Link>
          ))}
        </div>

        <div className={styles.footActions}>
          <Button variant="ghost" to={CALENDAR}>
            Calendar
          </Button>
          <Button variant="primary" to={GATHERING}>
            RSVP to 19 Jul →
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
