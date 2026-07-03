import { useState } from "react";
import { Link } from "react-router-dom";
import { FiLink, FiMail } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { InviteEmailForm } from "./InviteEmailForm";
import { InviteLinkPanel } from "./InviteLinkPanel";
import { SentInvitesList } from "./SentInvitesList";
import styles from "./InvitePage.module.css";

type Mode = "email" | "link";

export function InvitePage() {
  const [mode, setMode] = useState<Mode>("email");
  const [sentName, setSentName] = useState<string | null>(null);

  if (sentName) {
    return (
      <AppShell>
        <div className={styles.page}>
          <div className={styles.inner}>
            <div className={`${styles.card} ${styles.sent} ${styles.screenIn}`}>
              <div className={styles.sentIcon}>
                <svg
                  width={26}
                  height={26}
                  viewBox="0 0 26 26"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 13l21-10-8 10 8 10-21-10Z"
                    fill="rgba(74,140,111,.8)"
                  />
                </svg>
              </div>
              <div className={styles.sentHead}>
                Invitation sent to <em>{sentName}</em>
              </div>
              <div className={styles.sentSub}>
                We've sent {sentName} an email. They have 7 days to accept.
                You'll be notified when they join.
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.srRow}>
                  <span className={styles.srLabel}>Invited</span>
                  <span className={styles.srVal}>{sentName} Lima</span>
                </div>
                <div className={styles.srRow}>
                  <span className={styles.srLabel}>Sent</span>
                  <span className={styles.srVal}>Today, 10:42</span>
                </div>
                <div className={styles.srRow}>
                  <span className={styles.srLabel}>Expires</span>
                  <span className={styles.srVal}>13 June 2026</span>
                </div>
              </div>
              <div className={styles.actions}>
                <Button variant="ghost" to={routes.accountProfile}>
                  Back to my profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.inner}>
          <Link to={routes.accountProfile} className={styles.backLink}>
            ← Back to my profile
          </Link>
          <div className={styles.eyebrow}>Invite someone</div>
          <div className={styles.title}>
            Bring someone <em>in</em>
          </div>
          <div className={styles.sub}>
            QueerPulse grows through trust, not advertising. Use your invite for
            someone you'd genuinely vouch for.
          </div>
          <div className={styles.quotaRow}>
            <div className={styles.quotaChip}>
              1 invite available this month
            </div>
            <div className={styles.resetNote}>Resets 1 July 2026</div>
          </div>

          <div
            className={styles.segmented}
            role="tablist"
            aria-label="Delivery method"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "email"}
              className={`${styles.segBtn} ${mode === "email" ? styles.segBtnActive : ""}`}
              onClick={() => setMode("email")}
            >
              <FiMail aria-hidden />
              Send via email
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "link"}
              className={`${styles.segBtn} ${mode === "link" ? styles.segBtnActive : ""}`}
              onClick={() => setMode("link")}
            >
              <FiLink aria-hidden />
              Share a link
            </button>
          </div>

          {mode === "email" ? (
            <InviteEmailForm onSent={(name) => setSentName(name)} />
          ) : (
            <InviteLinkPanel />
          )}

          <SentInvitesList />
        </div>
      </div>
    </AppShell>
  );
}
