import { Button, FadeIn } from "../../shared/components/ui";
import type { ToastContextValue } from "../../shared/components/feedback/toastContext";
import { routes } from "../../app/routeMap";
import { COMMITMENTS, FILTERS, RESOURCES } from "./accessibility.data";
import {
  AccessibleVenueCard,
  AccessibleVenueCardSkeleton,
} from "./AccessibleVenueCard";
import type { Venue } from "./accessibility.data";
import styles from "./AccessibilityPage.module.css";

export function AccessibleSpacesSection({
  loading,
  filter,
  setFilter,
  venues,
  onFlag,
}: {
  loading: boolean;
  filter: string;
  setFilter: (f: string) => void;
  venues: Venue[];
  onFlag: (name: string) => void;
}) {
  return (
    <section className={styles.sec} id="spaces">
      <div className="wrap">
        <div className={styles.secHead}>
          <h2>
            Accessible <em>spaces</em>
          </h2>
          <p>
            Not a binary accessible/not-accessible list. Real detail, reviewed
            by disabled members of this community. Filter by what matters to
            you.
          </p>
        </div>
        <div className={styles.venueFilter}>
          <span className={styles.vfLabel}>Filter</span>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={[styles.vfChip, filter === f.id && styles.vfChipOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className={styles.venueGrid}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <AccessibleVenueCardSkeleton key={i} />
            ))
          ) : venues.length === 0 ? (
            <div className={styles.venueEmpty}>
              <p>No venues match that filter yet.</p>
              <p className={styles.small}>
                Know of one? Let us know in the forum.
              </p>
            </div>
          ) : (
            venues.map((v, i) => (
              <FadeIn key={v.name} delay={Math.min(i, 8) * 60}>
                <AccessibleVenueCard v={v} onFlag={() => onFlag(v.name)} />
              </FadeIn>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export function CommitmentsSection({
  onRequestAccom,
}: {
  onRequestAccom: () => void;
}) {
  return (
    <section className={`${styles.sec} ${styles.secAlt}`}>
      <div className="wrap">
        <div className={styles.secHead}>
          <h2>
            Our <em>commitments</em>
          </h2>
          <p>
            These are what QueerPulse does to make gatherings, events, and the
            platform more accessible. Not a brochure — a baseline we're
            accountable to, and want to keep improving.
          </p>
        </div>
        <div className={styles.commitGrid}>
          {COMMITMENTS.map((c) => (
            <div className={styles.commitCard} key={c.title}>
              <div className={styles.ccIcon}>
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="var(--jade)"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {c.icon}
                </svg>
              </div>
              <div className={styles.ccTitle}>{c.title}</div>
              <div className={styles.ccBody}>{c.body}</div>
              <div className={styles.ccStatus}>{c.status}</div>
            </div>
          ))}
        </div>
        <div className={styles.accomStrip}>
          <div>
            <h3>Need something specific for a QueerPulse event?</h3>
            <p>
              Request accommodations in advance and we'll do everything we can.
              No need to justify or explain — just tell us what you need.
            </p>
          </div>
          <Button type="button" variant="primary" onClick={onRequestAccom}>
            Request accommodations
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ResourcesSection({
  showToast,
}: {
  showToast: ToastContextValue["showToast"];
}) {
  return (
    <section className={styles.sec}>
      <div className="wrap">
        <div className={styles.secHead}>
          <h2>
            Resources for disabled <em>queer people in Lisbon</em>
          </h2>
          <p>
            Practical support for navigating disability as a queer person in
            Portugal — benefits, healthcare, and community.
          </p>
        </div>
        <div className={styles.resourceGrid}>
          {RESOURCES.map((r) => (
            <div className={styles.resourceCard} key={r.title}>
              <div className={styles.rcEyebrow}>{r.eyebrow}</div>
              <div className={styles.rcTitle}>{r.title}</div>
              <div className={styles.rcBody}>{r.body}</div>
              <div className={styles.rcLink}>
                <a onClick={() => showToast("Opening resource…", "info")}>
                  {r.link}
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.peerStrip}>
          <div>
            <h3>
              Peer support — <em>disabled &amp; chronically ill members</em>
            </h3>
            <p>
              A closed community group within QueerPulse for disabled and
              chronically ill members. No inspiration required. Just people who
              understand.
            </p>
          </div>
          <div className={styles.peerActions}>
            <Button
              type="button"
              variant="primary"
              onClick={() => showToast("Joining the group…", "success")}
            >
              Join the group
            </Button>
            <Button to={routes.mentorship} variant="ghost-dark">
              Find a peer mentor →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
