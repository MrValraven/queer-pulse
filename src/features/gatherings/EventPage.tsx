import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Avatar, ImageSlot } from "../../shared/components/ui";
import { FiLock } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { DETAILS, HERO_IMAGE } from "./eventPage.data";
import { EventRsvpCard } from "./EventRsvpCard";
import { JoinVouchCallout } from "./JoinVouchCallout";
import styles from "./EventPage.module.css";

export function EventPage() {
  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Link to={routes.calendar} className={styles.back}>
            ← Gatherings
          </Link>
          <div className={styles.type}>
            Community gathering · Food &amp; conversation
          </div>
          <h1 className={styles.title}>
            Newcomer
            <br />
            <em>Welcome Dinner</em>
          </h1>
          <div className={styles.hostRow}>
            <Avatar initials="MC" tint="coral" size={34} />
            <div className={styles.by}>
              Hosted by <strong>Mateus Costa</strong> ·{" "}
              <Link
                to={routes.members}
                style={{
                  color: "rgba(247,243,238,.58)",
                  textDecoration: "underline",
                }}
              >
                View profile
              </Link>
            </div>
          </div>
          <div className={styles.pills}>
            <span className={`${styles.pill} ${styles.pillHighlight}`}>
              Sat 14 June · 7:00pm
            </span>
            <span className={styles.pill}>Casa do Alentejo, Intendente</span>
            <span className={styles.pill}>Sliding scale · €0–€15</span>
            <span className={styles.pill}>5 spots left</span>
          </div>
        </div>
        <ImageSlot
          tint="plum"
          src={HERO_IMAGE}
          height={320}
          radius={0}
          placeholder="Event image — warm dinner setting, long communal table, candlelight"
          className={styles.imgStrip}
        />
      </div>

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>About this gathering</div>
                <div className={styles.text}>
                  <p>
                    Once a month, we set a long table for people who have
                    recently arrived in Lisbon — or who arrived a while ago and
                    never quite found their people. This dinner is informal,
                    unhurried, and bilingual. You don't need to know anyone.
                  </p>
                  <p>
                    We eat well, we stay too long, we probably talk about
                    housing at some point. The idea is to make introductions
                    that have a chance of becoming something real. Some of the
                    people at the last dinner have since become flatmates,
                    collaborators, or close friends.
                  </p>
                  <p>
                    <strong>Accessibility:</strong> Casa do Alentejo is
                    accessible by wheelchair via the side entrance on Rua de
                    Palma. Step-free access to all areas.
                  </p>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>Event details</div>
                <div className={styles.details}>
                  {DETAILS.map((detail) => (
                    <div key={detail.label} className={styles.detail}>
                      <div className={styles.detailIcon}>
                        <detail.icon />
                      </div>
                      <div>
                        <div className={styles.detailLabel}>{detail.label}</div>
                        <div className={styles.detailValue}>{detail.value}</div>
                        <div className={styles.detailSub}>{detail.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.locReveal}>
                  <span className={styles.locIcon} aria-hidden>
                    <FiLock />
                  </span>
                  <div>
                    <div className={styles.locRevealHood}>Intendente</div>
                    <div className={styles.locRevealNote}>
                      The exact address and door details are shared with
                      confirmed guests after you RSVP.
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  Community guidelines for this event
                </div>
                <div className={styles.text}>
                  <p>
                    This is a private QueerPulse event. Everyone here has been
                    invited because someone vouched for them or because they are
                    already a member. The Code of Care applies. Be warm. Be
                    present. Don't take photos of people without asking.
                  </p>
                  <p>
                    The sliding scale is not a suggestion — if you can pay the
                    higher tier, please do. It directly subsidises someone
                    else's ticket.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.aside}>
              <EventRsvpCard />

              <div className={styles.membersOnly}>
                <div
                  className="mo-title"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--jade)",
                    marginBottom: 6,
                  }}
                >
                  QueerPulse members only
                </div>
                <p>
                  This event is private. If someone forwarded you this link, ask
                  them to invite you to the network first.
                </p>
              </div>

              <div className={styles.calloutWrap}>
                <JoinVouchCallout />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
