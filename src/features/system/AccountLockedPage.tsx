import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { SystemStateShell } from "../../shared/components/layout";
import styles from "./AccountLockedPage.module.css";

export function AccountLockedPage() {
  return (
    <SystemStateShell>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>

        <div className={styles.kicker}>Account locked · temporary</div>
        <h1 className={styles.heading}>
          Your account is <em>on pause.</em>
        </h1>
        <p className={styles.lead}>
          We spotted unusual sign-in activity on your account and locked it as a
          precaution. You're not in trouble — we'd rather over-react than risk
          it.
        </p>

        <div className={styles.reasonList}>
          <div className={styles.reasonRow}>
            <div className={styles.reasonIcon}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 14" />
              </svg>
            </div>
            <div className={styles.reasonText}>
              <b>5 failed sign-in attempts</b> in the last 12 minutes, from two
              devices.
            </div>
          </div>
          <div className={styles.reasonRow}>
            <div className={styles.reasonIcon}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M12 22s-8-4-8-12V4l8-2 8 2v6c0 8-8 12-8 12z" />
              </svg>
            </div>
            <div className={styles.reasonText}>
              <b>New location:</b> attempt from <b>Madrid, Spain</b> — you
              usually sign in from Lisbon.
            </div>
          </div>
          <div className={styles.reasonRow}>
            <div className={styles.reasonIcon}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </div>
            <div className={styles.reasonText}>
              <b>Lock will lift automatically</b> in 23 minutes — or use one of
              the options below to unlock now.
            </div>
          </div>
        </div>

        <div className={styles.whatNow}>
          <Link to={routes.passwordReset} className={styles.wnRow}>
            <div className={styles.wnNum}>1</div>
            <div className={styles.wnText}>
              <div className={styles.wnTitle}>Reset your password</div>
              <div className={styles.wnDesc}>
                Quickest if you're the rightful owner — we'll send a link.
              </div>
            </div>
            <span className={styles.wnArrow} aria-hidden>
              →
            </span>
          </Link>
          <Link to={routes.magicLink} className={styles.wnRow}>
            <div className={styles.wnNum}>2</div>
            <div className={styles.wnText}>
              <div className={styles.wnTitle}>Sign in with a magic link</div>
              <div className={styles.wnDesc}>
                Skip the password — confirm via email.
              </div>
            </div>
            <span className={styles.wnArrow} aria-hidden>
              →
            </span>
          </Link>
          <Link to={routes.contact} className={styles.wnRow}>
            <div className={styles.wnNum}>3</div>
            <div className={styles.wnText}>
              <div className={styles.wnTitle}>Contact the team</div>
              <div className={styles.wnDesc}>
                If none of the above work, write to us and we'll verify you by
                hand.
              </div>
            </div>
            <span className={styles.wnArrow} aria-hidden>
              →
            </span>
          </Link>
        </div>

        <div className={styles.foot}>
          <span>
            Incident <span className={styles.incidentId}>QP-8423-LOCK</span> ·
            14:08 WET
          </span>
          <span>
            <Link to={routes.help}>Why does this happen?</Link>
          </span>
        </div>
      </div>
    </SystemStateShell>
  );
}
