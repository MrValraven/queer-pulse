import { Link } from "react-router-dom";
import { Button, FadeIn } from "../../shared/components/ui";
import type { VolunteerOpportunity } from "./volunteerOpportunities";
import { routes } from "../../app/routeMap";
import styles from "./VolunteerOpportunityPage.module.css";

const MEMBER = routes.members;
const MESSAGES = routes.messages;
const PARTNER = routes.partner;
const DONATE = routes.donate;

export function VolunteerOpportunitySidebar({
  opp,
  applied,
  submitting,
  apply,
  alternatives,
}: {
  opp: VolunteerOpportunity;
  applied: boolean;
  submitting: boolean;
  apply: () => void;
  alternatives: VolunteerOpportunity[];
}) {
  return (
    <aside className={styles.side}>
      {applied ? (
        <FadeIn className={styles.appliedCard}>
          <div className={styles.appliedIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--jade-soft)"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className={styles.appliedTitle}>
            You're <em>on the list.</em>
          </div>
          <p className={styles.appliedText}>{opp.applyConfirm}</p>
          <Button variant="ghost-dark" className={styles.ctaBtn} to={MESSAGES}>
            Message the team
          </Button>
        </FadeIn>
      ) : (
        <div className={styles.card}>
          <div className={styles.applyHead}>
            <h4>Apply</h4>
            <div className={styles.role}>{opp.applyRole}</div>
          </div>
          <div className={styles.spotsRow}>
            <span>Spots filled</span>
            <b>{opp.spotsFilled}</b>
          </div>
          <div className={styles.spotsBar}>
            <span style={{ width: `${opp.spotsPct}%` }} />
          </div>
          {opp.spots.map((r) => (
            <div className={styles.spotsRow} key={r.label}>
              <span>{r.label}</span>
              {r.value}
            </div>
          ))}
          <div className={styles.cta}>
            <Button
              variant="primary"
              className={styles.ctaBtn}
              onClick={apply}
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? "Sending your application…" : "Apply →"}
            </Button>
            <Button variant="ghost" className={styles.ctaBtn} to={MESSAGES}>
              Ask the team
            </Button>
          </div>
          <p className={styles.footNote}>
            Returning volunteers:{" "}
            <Link to={MEMBER}>use last year's profile →</Link> · skips the
            screen.
          </p>
        </div>
      )}

      {opp.partner && (
        <div className={styles.card}>
          <div className={styles.cardLabel}>In partnership with</div>
          <span className={styles.partnerPill}>{opp.partner.name}</span>
          <p className={styles.partnerText}>{opp.partner.text}</p>
          <Link to={PARTNER} className={styles.partnerLink}>
            About the partnership →
          </Link>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardLabel}>Not the right fit?</div>
        <p className={styles.altText}>Other ways to help right now:</p>
        <div className={styles.altList}>
          {alternatives.map((a) => (
            <Link key={a.slug} to={`${routes.volunteer}/opportunity/${a.slug}`}>
              → {a.role} · {a.org}
            </Link>
          ))}
          <Link to={DONATE}>→ Fund this work instead</Link>
        </div>
      </div>
    </aside>
  );
}
