import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, FormField } from "../../shared/components/ui";
import { AuthLayout } from "./AuthLayout";
import { routes } from "../../app/routeMap";
import { WHAT_NEXT } from "./requestInvite.data";
import styles from "./auth.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RequestInvitePage() {
  const [first, setFirst] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [why, setWhy] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [sent, setSent] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const emailError = touched && email.trim().length > 0 && !emailValid;
  const canSubmit = emailValid && why.trim().length > 0 && agreed;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSent(true);
  }

  if (sent) {
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
            Thanks{first.trim() ? `, ${first.trim()}` : ""} — your request to
            join QueerPulse is in. Here's what happens from here.
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

  return (
    <AuthLayout wide>
      <div className={styles.eyebrow}>Request an invite</div>
      <h1>
        Ask to come <em>in.</em>
      </h1>
      <p className={styles.sub}>
        QueerPulse grows through trust, not advertising. The surest way in is a
        member who'll vouch for you — if you know someone here, ask them. If you
        don't, tell us a little about you and we'll take it from there.
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.twoCol}>
          <FormField label="Your name">
            <input
              id="ri-first"
              type="text"
              placeholder="Alex"
              autoComplete="given-name"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
          </FormField>
          <FormField label="City">
            <input
              id="ri-city"
              type="text"
              placeholder="Lisbon"
              autoComplete="address-level2"
            />
          </FormField>
        </div>

        <FormField
          label="Email"
          required
          error={
            emailError
              ? "That email doesn't look right — mind checking it?"
              : undefined
          }
        >
          <input
            id="ri-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={emailError}
          />
        </FormField>

        <FormField
          label={
            <>
              Anyone here you know{" "}
              <span
                style={{
                  fontWeight: 400,
                  textTransform: "none",
                  letterSpacing: 0,
                  fontSize: 11,
                }}
              >
                (optional)
              </span>
            </>
          }
          helper="Naming a mutual is the fastest route in — but it's not required."
        >
          <input
            id="ri-mutual"
            type="text"
            placeholder="A member who can vouch for you"
          />
        </FormField>

        <FormField
          label="Why QueerPulse"
          required
          labelAside={`${why.length}/400`}
        >
          <textarea
            id="ri-why"
            maxLength={400}
            placeholder="What you're looking for, and what brings you here. A few honest sentences is plenty."
            value={why}
            onChange={(e) => setWhy(e.target.value)}
          />
        </FormField>

        <div className={styles.agreeRow}>
          <input
            id="ri-agree"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <label htmlFor="ri-agree">
            I've read the{" "}
            <Link to={routes.guidelines} onClick={(e) => e.stopPropagation()}>
              community guidelines
            </Link>{" "}
            and I'm here in good faith.
          </label>
        </div>

        <Button type="submit" className={styles.authBtn} disabled={!canSubmit}>
          Send my request
        </Button>
      </form>

      <div className={styles.footer}>
        <Link
          to={routes.signIn}
          style={{ fontSize: 13.5, color: "var(--ink-60)", fontWeight: 500 }}
        >
          Already a member? Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
