import { Link } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { routes } from "../../app/routeMap";
import { WHAT_NEXT } from "./requestInvite.data";
import styles from "./auth.module.css";

export function RequestInviteSent({ first }: { first: string }) {
  return (
    <AuthLayout wide>
      <div className={styles.screenIn} style={{ textAlign: "center" }}>
        <div className={styles.sentIc}>
          <svg
            viewBox="0 0 24 24"
            width={32}
            height={32}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 5 5L20 7" />
          </svg>
        </div>
        <h1>
          You're on the <em>list.</em>
        </h1>
        <p
          className={styles.sub}
          style={{ maxWidth: "34ch", margin: "0 auto 28px" }}
        >
          Thanks{first.trim() ? `, ${first.trim()}` : ""} — your request to join
          QueerPulse is in. Here's what happens from here.
        </p>

        <ol className={styles.nextList}>
          {WHAT_NEXT.map((step, i) => (
            <li key={step.title} className={styles.nextRow}>
              <span className={styles.nextNum}>{i + 1}</span>
              <span className={styles.nextText}>
                <span className={styles.nextTitle}>{step.title}</span>
                <span className={styles.nextBody}>{step.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className={styles.footer}>
          <Link
            to={routes.homepage}
            style={{
              fontSize: 13.5,
              color: "var(--ink-60)",
              fontWeight: 500,
            }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
