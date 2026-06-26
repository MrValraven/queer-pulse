import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { FiStar } from "react-icons/fi";
import styles from "./CoHostInvitePage.module.css";

const NOTIFICATIONS = routes.notifications;
const MESSAGES = routes.messages;

const ROLES = [
  { ic: "G", title: "Greet at the door, 18:30 — 19:30", desc: "Check names against the RSVP list. Anika will join you by 19:00.", perm: "Required", permCls: "permYes" },
  { ic: "R", title: "Manage the room flow", desc: "Walk between Dr. Pereira and the pharmacist's tables so neither gets a queue.", perm: "Required", permCls: "permYes" },
  { ic: "M", title: "Co-moderate questions", desc: "If a public Q&A breaks out, you and Anika tag-team it.", perm: "Required", permCls: "permYes" },
  { ic: "P", title: "Edit the event page", desc: "Add/remove RSVPs, change time, send updates, post a recap after.", perm: "Granted", permCls: "permYes" },
  { ic: "F", title: "Access the host fund", desc: "€60 spending budget for tea/coffee, small first-aid kit, and after-snacks.", perm: "Anika only", permCls: "permNo" },
  { ic: "C", title: "Cancel the event", desc: "This stays with Anika as the lead host.", perm: "Anika only", permCls: "permNo" },
];

const COMMITMENTS = [
  { b: "~ 30 min prep", s: "Read the runbook, message Anika once before. That's it." },
  { b: "2.5 hours on the night", s: "Arrive 30 min early, stay 15 min after for tidy-up." },
  { b: "~ 15 min after", s: "Write a short recap. Anika handles the post." },
  { b: "One ask post-event", s: "If a follow-up question comes in, you'll see it & can reply." },
];

export function CoHostInvitePage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const accept = () => {
    showToast("You're co-hosting with Anika — host tools unlocked", "success", 3500);
    setTimeout(() => navigate(routes.manageGathering), 1300);
  };
  const decline = () => {
    showToast("Polite no sent to Anika. She'll find another second pair of hands.", "info", 3000);
    setTimeout(() => navigate(NOTIFICATIONS), 1300);
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={NOTIFICATIONS} className={styles.back}>
          ← Notifications
        </Link>

        <div className={styles.hero}>
          <span className={styles.eyebrow}>Co-host invitation</span>
          <h1 className={styles.h1}>
            Anika wants you to <em>co-host</em> with her.
          </h1>
          <p className={styles.sub}>
            She's running an open clinic night and would like a second person at the door
            — for vibes, for the line, and so the night doesn't rest on one set of
            shoulders. <em>Read it through, decide tomorrow if you'd rather sleep on it.</em>
          </p>
        </div>

        <div className={styles.fromCard}>
          <div className={styles.fromAv}>AK</div>
          <div>
            <div className={styles.fromName}>Anika Kovač</div>
            <div className={styles.fromRole}>Healthcare designer · Trans &amp; Non-Binary Network</div>
            <div className={styles.fromMeta}>
              <b>Hosted 14 gatherings</b>
              <span className={styles.dot}>·</span>
              <b>4.9 <FiStar /></b> from attendees
              <span className={styles.dot}>·</span>You've been to 3 of hers
            </div>
          </div>
          <div className={styles.fromStats}>
            <b>11 mutuals</b>
            <br />
            Invited <b>2 hours ago</b>
            <br />
            Reply by <b>10 Jun</b>
          </div>
        </div>

        <div className={styles.eventCard}>
          <div className={styles.eventH}>
            <div className={styles.eventDate}>
              <div className="d">12</div>
              <div className="m">Jun</div>
            </div>
            <div className={styles.eventInfo}>
              <h2>
                Open clinic night — <em>bring your prescription questions.</em>
              </h2>
              <div className={styles.eventMeta}>
                <b>Thu 19:00 — 21:00</b>
                <span className={styles.dot} />
                <b>Café Beirão</b> · Anjos
                <span className={styles.dot} />
                <span>22 RSVPs · 14 waitlist</span>
              </div>
            </div>
          </div>
          <p className={styles.personal}>
            "I'd love to do this with you. You're calmer than I am about the front-door bit
            and you know Sandra and Rui. I'll bring the doctor, the pharmacist, and the
            kettle — <em>can you bring the room?</em>"
          </p>
        </div>

        <div className={styles.roleCard}>
          <h3>
            What being <em>co-host</em> would mean
          </h3>
          <div>
            {ROLES.map((r) => (
              <div className={styles.roleRow} key={r.title}>
                <div className={styles.roleIc}>{r.ic}</div>
                <div className={styles.roleText}>
                  <b>{r.title}</b>
                  <span>{r.desc}</span>
                </div>
                <div className={`${styles.rolePerm} ${styles[r.permCls]}`}>{r.perm}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.commitCard}>
          <h3>
            The honest <em>commitment</em>
          </h3>
          <p className={styles.commitSub}>
            What this actually costs you. We'd rather you say no than show up tired.
          </p>
          <div className={styles.commitGrid}>
            {COMMITMENTS.map((c) => (
              <div className={styles.commit} key={c.b}>
                <b>{c.b}</b>
                <span>{c.s}</span>
              </div>
            ))}
          </div>
          <p className={styles.outclause}>
            <b>If something comes up, you can step back any time before the day-of</b> — no
            shame, no penalty, just send Anika a one-line message. We've all had a Thursday
            go sideways.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.later} onClick={() => showToast("Snoozed — will remind you tomorrow", "info")}>
            Sleep on it
          </button>
          <div className={styles.actionsRight}>
            <Button variant="ghost" onClick={decline}>
              Decline politely
            </Button>
            <Button variant="primary" onClick={accept}>
              Yes — co-host with Anika
            </Button>
          </div>
        </div>
        <p className={styles.actionMeta}>
          Either choice messages Anika directly. She'll see your decision but not be
          notified by push — <b>this is meant to be relaxed</b>.{" "}
          <Link to={MESSAGES} style={{ color: "var(--plum)", fontWeight: 600 }}>
            Open messages →
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
