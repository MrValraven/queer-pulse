import { Link } from "react-router-dom";
import { Button, FadeIn } from "../../shared/components/ui";
import type { VolunteerOpportunity } from "./volunteerOpportunities";
import type { SignupRow } from "./api/volunteering.adapters";
import { VolunteerSignupsCard } from "./VolunteerSignupsCard";
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
  withdraw,
  withdrawing,
  error,
  isFull,
  isPoster,
  signups,
  signupsLoading,
  onCloseOpportunity,
  closing,
  closed,
  alternatives,
}: {
  opp: VolunteerOpportunity;
  applied: boolean;
  submitting: boolean;
  apply: () => void;
  withdraw: () => void;
  withdrawing: boolean;
  error: string | null;
  isFull: boolean;
  isPoster: boolean;
  signups: SignupRow[];
  signupsLoading: boolean;
  onCloseOpportunity: () => void;
  closing: boolean;
  closed: boolean;
  alternatives: VolunteerOpportunity[];
}) {
  const partnerTo = opp.partner?.slug
    ? `${routes.partners}/${opp.partner.slug}`
    : PARTNER;

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
          <button
            type="button"
            className={styles.withdrawLink}
            onClick={withdraw}
            disabled={withdrawing}
            aria-busy={withdrawing}
          >
            {withdrawing ? "Withdrawing…" : "Withdraw my interest"}
          </button>
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
              {typeof r.value === "string" ? <b>{r.value}</b> : r.value}
            </div>
          ))}
          <div className={styles.cta}>
            <Button
              variant="primary"
              className={styles.ctaBtn}
              onClick={apply}
              disabled={submitting || isFull}
              aria-busy={submitting}
            >
              {isFull
                ? "This role is full"
                : submitting
                  ? "Sending your application…"
                  : "Apply →"}
            </Button>
            <Button variant="ghost" className={styles.ctaBtn} to={MESSAGES}>
              Ask the team
            </Button>
          </div>
          {error && (
            <p className={styles.applyError} role="alert">
              {error}
            </p>
          )}
          <p className={styles.footNote}>
            Returning volunteers:{" "}
            <Link to={MEMBER}>use last year's profile →</Link> · skips the
            screen.
          </p>
        </div>
      )}

      {isPoster && (
        <VolunteerSignupsCard
          signups={signups}
          loading={signupsLoading}
          onClose={onCloseOpportunity}
          closing={closing}
          closed={closed}
        />
      )}

      {opp.partner && (
        <div className={styles.card}>
          <div className={styles.cardLabel}>In partnership with</div>
          <span className={styles.partnerPill}>{opp.partner.name}</span>
          <p className={styles.partnerText}>{opp.partner.text}</p>
          <Link to={partnerTo} className={styles.partnerLink}>
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
