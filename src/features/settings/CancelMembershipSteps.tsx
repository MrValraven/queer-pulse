import { type Dispatch, type SetStateAction } from "react";
import { FiHeart, FiPause, FiArrowDown } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { currentUserEmail } from "../members/data/members";
import {
  REASONS,
  ENDS,
  STAYS,
  type Alt,
  type Step,
} from "./cancelMembership.data";
import styles from "./CancelMembershipPage.module.css";

export function CancelStepper({
  step,
  stepNum,
}: {
  step: Step;
  stepNum: number;
}) {
  return (
    <div className={styles.stepper}>
      {[1, 2, 3].map((n, i) => {
        const labels = ["Options", "Tell us why", "Confirm"];
        const isActive = step !== "done" && stepNum === n;
        const isDone = step === "done" ? true : stepNum > n;
        return (
          <>
            <div
              key={n}
              className={`${styles.cs} ${isActive ? styles.csActive : ""} ${isDone ? styles.csDone : ""}`}
            >
              <div className={styles.csN}>{n}</div>
              <div className={styles.csL}>{labels[i]}</div>
            </div>
            {i < 2 && (
              <div
                key={`bar-${n}`}
                className={`${styles.csBar} ${isDone ? styles.csBarDone : ""}`}
              />
            )}
          </>
        );
      })}
    </div>
  );
}

export function CancelStepOptions({
  onPickAlt,
  onContinue,
}: {
  onPickAlt: (a: Alt) => void;
  onContinue: () => void;
}) {
  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="1">
      <h2>
        Your current <em>membership</em>
      </h2>
      <div className={styles.curr}>
        <div className={styles.currBadge}>S</div>
        <div>
          <div className={styles.currTier}>
            Sustainer · <em>annual</em>
          </div>
          <div className={styles.currMeta}>
            Renewed <b>6 Jun 2026</b> · next charge <b>6 Jun 2027</b>
          </div>
        </div>
        <div className={styles.currPrice}>
          €96<span className={styles.currCy}>/ year</span>
        </div>
      </div>
      <h2 style={{ marginTop: 14 }}>
        Before you go — <em>three softer options</em>
      </h2>
      <p className={styles.paneSub}>
        Each takes 30 seconds. You can always come back to cancel.
      </p>
      <div className={styles.altList}>
        <button
          type="button"
          className={styles.alt}
          onClick={() => onPickAlt("pause")}
        >
          <div className={styles.altIc}>⏸</div>
          <div className={styles.altText}>
            <div className={styles.altT}>Pause for 3 months</div>
            <div className={styles.altD}>
              We freeze your renewal. You keep access. We don't charge until you
              resume.
            </div>
          </div>
          <div className={styles.altArrow}>→</div>
        </button>
        <button
          type="button"
          className={styles.alt}
          onClick={() => onPickAlt("downshift")}
        >
          <div
            className={styles.altIc}
            style={{
              background: "rgba(var(--accent-rgb),.12)",
              color: "var(--accent-ink)",
            }}
          >
            ↓
          </div>
          <div className={styles.altText}>
            <div className={styles.altT}>Downshift to Member (€36/year)</div>
            <div className={styles.altD}>
              Keep all community access. Drop Sustainer-only perks (open studio,
              ILGA consult, magazine).
            </div>
          </div>
          <div className={styles.altArrow}>→</div>
        </button>
        <button
          type="button"
          className={styles.alt}
          onClick={() => onPickAlt("solidarity")}
        >
          <div
            className={styles.altIc}
            style={{
              background: "rgba(45,27,61,.08)",
              color: "var(--plum)",
            }}
          >
            <FiHeart />
          </div>
          <div className={styles.altText}>
            <div className={styles.altT}>Drop to solidarity rate</div>
            <div className={styles.altD}>
              €12/year, no questions asked. The fund covers the difference.{" "}
              <b>Genuinely.</b>
            </div>
          </div>
          <div className={styles.altArrow}>→</div>
        </button>
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onContinue}>
          Continue cancelling →
        </Button>
        <Button variant="ghost" to={routes.membership}>
          Keep my Sustainer
        </Button>
      </div>
    </div>
  );
}

export function CancelStepReasons({
  checked,
  setChecked,
  onBack,
  onContinue,
}: {
  checked: Set<string>;
  setChecked: Dispatch<SetStateAction<Set<string>>>;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="2">
      <h2>
        Help us <em>understand.</em>
      </h2>
      <p className={styles.paneSub}>
        Optional, but useful. We read every response. Pick what fits.
      </p>
      <div className={styles.reasonList}>
        {REASONS.map((r) => (
          <label
            key={r.id}
            className={`${styles.reason} ${checked.has(r.id) ? styles.reasonChecked : ""}`}
          >
            <input
              type="checkbox"
              checked={checked.has(r.id)}
              onChange={(e) =>
                setChecked((prev) => {
                  const n = new Set(prev);
                  if (e.target.checked) n.add(r.id);
                  else n.delete(r.id);
                  return n;
                })
              }
            />
            <div className={styles.reasonText}>{r.label}</div>
          </label>
        ))}
      </div>
      <p
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: ".07em",
          textTransform: "uppercase",
          color: "var(--ink-40)",
          marginTop: 8,
        }}
      >
        Anything you'd like to add? (optional)
      </p>
      <textarea
        className={styles.reasonTextarea}
        placeholder="A sentence or two helps us notice patterns. Nothing's shown to other members."
      />
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="ghost" onClick={onContinue}>
          Continue →
        </Button>
      </div>
    </div>
  );
}

export function CancelStepConfirm({
  confirmed,
  setConfirmed,
  onBack,
  onCancel,
}: {
  confirmed: boolean;
  setConfirmed: (v: boolean) => void;
  onBack: () => void;
  onCancel: () => void;
}) {
  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="3">
      <h2>
        One last <em>check.</em>
      </h2>
      <p className={styles.paneSub}>
        Here's what changes when you cancel — and what doesn't.
      </p>
      <div className={styles.secLabel}>What ends</div>
      <div className={styles.loseGrid}>
        {ENDS.map((e) => (
          <div key={e.t} className={styles.lose}>
            <b>{e.t}</b>
            <span>{e.d}</span>
          </div>
        ))}
      </div>
      <div className={styles.secLabel}>What stays — free, forever</div>
      <div className={styles.loseGrid}>
        {STAYS.map((s) => (
          <div key={s.t} className={`${styles.lose} ${styles.keep}`}>
            <b>{s.t}</b>
            <span>{s.d}</span>
          </div>
        ))}
      </div>
      <p
        style={{
          fontSize: 14,
          color: "var(--ink-60)",
          lineHeight: 1.65,
          marginBottom: 8,
        }}
      >
        Your access continues until{" "}
        <b style={{ color: "var(--plum)" }}>6 Jun 2027</b>. No refund — but no
        further charges.
      </p>
      <p
        style={{
          fontSize: 14,
          color: "var(--ink-60)",
          lineHeight: 1.65,
          marginBottom: 18,
        }}
      >
        If something feels off, write to{" "}
        <a
          href="mailto:cancel@queerpulse.app"
          style={{
            color: "var(--plum)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          cancel@queerpulse.app
        </a>{" "}
        — a real person reads it.
      </p>
      <div className={styles.confirmRow}>
        <input
          type="checkbox"
          id="confirm-check"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <label htmlFor="confirm-check">
          I understand my Sustainer membership will not renew, and{" "}
          <b>my access ends 6 Jun 2027</b>. I can come back any time.
        </label>
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <div className={styles.actionRight}>
          <Button variant="primary" to={routes.membership}>
            Keep my Sustainer
          </Button>
          <Button variant="ghost" disabled={!confirmed} onClick={onCancel}>
            Cancel my membership
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CancelDone() {
  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="done">
      <div className={styles.farewell}>
        <div className={styles.farewellIc}>
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h2
          className={styles.h1}
          style={{ margin: "0 auto 10px", fontSize: 36 }}
        >
          Until <em>next time.</em>
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "var(--ink-60)",
            lineHeight: 1.65,
            maxWidth: "42ch",
            margin: "0 auto 8px",
          }}
        >
          Your Sustainer membership won't renew. Access continues through{" "}
          <b style={{ color: "var(--plum)", fontWeight: 700 }}>6 Jun 2027</b>.
        </p>
        <p
          style={{
            fontSize: 15,
            color: "var(--ink-60)",
            lineHeight: 1.65,
            maxWidth: "42ch",
            margin: "0 auto 8px",
          }}
        >
          We sent a confirmation to{" "}
          <b style={{ color: "var(--plum)" }}>{currentUserEmail}</b> with
          everything written down.
        </p>
        <p style={{ fontSize: 13, color: "var(--ink-40)", marginTop: 12 }}>
          If this was a mistake, you can resubscribe one-tap from the email or
          your account settings — no penalty.
        </p>
        <div className={styles.farewellBtns}>
          <Button variant="primary" to={routes.homepage}>
            Back to home
          </Button>
          <Button variant="ghost" to={routes.membership}>
            Resubscribe
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CancelPaused({ onUndo }: { onUndo: () => void }) {
  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="paused">
      <div className={styles.farewell}>
        <div className={`${styles.farewellIc} ${styles.farewellIcJade}`}>
          <FiPause />
        </div>
        <h2
          className={styles.h1}
          style={{ margin: "0 auto 10px", fontSize: 36 }}
        >
          Paused — <em>see you soon.</em>
        </h2>
        <p className={styles.fwLead}>
          We've frozen your Sustainer renewal for <b>3 months</b>. You keep full
          access the whole time — and we won't charge you a cent until you
          resume.
        </p>
        <p className={styles.fwLead}>
          Your renewal moves to <b>6 Sep 2027</b>. We sent the details to{" "}
          <b>{currentUserEmail}</b>.
        </p>
        <p className={styles.fwNote}>
          Changed your mind? You can resume any time — it picks up right where
          you left off, no penalty.
        </p>
        <div className={styles.farewellBtns}>
          <Button variant="primary" to={routes.membership}>
            Back to membership
          </Button>
          <Button variant="ghost" onClick={onUndo}>
            Undo pause
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CancelDownshifted({ onUndo }: { onUndo: () => void }) {
  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="downshifted">
      <div className={styles.farewell}>
        <div className={`${styles.farewellIc} ${styles.farewellIcAccent}`}>
          <FiArrowDown />
        </div>
        <h2
          className={styles.h1}
          style={{ margin: "0 auto 10px", fontSize: 36 }}
        >
          Welcome to <em>Member.</em>
        </h2>
        <p className={styles.fwLead}>
          You're on the <b>Member</b> plan now — <b>€36/year</b>. All your
          community access stays exactly as it was.
        </p>
        <p className={styles.fwLead}>
          Your Sustainer-only perks (Open Studio, ILGA consult, the print
          magazine) wind down at the end of your current term. Your next charge
          is <b>€36 on 6 Jun 2027</b>.
        </p>
        <p className={styles.fwNote}>
          Confirmation is on its way to <b>{currentUserEmail}</b>. You can
          upgrade back to Sustainer any time.
        </p>
        <div className={styles.farewellBtns}>
          <Button variant="primary" to={routes.membership}>
            Back to membership
          </Button>
          <Button variant="ghost" onClick={onUndo}>
            Undo — keep Sustainer
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CancelSolidarity({ onUndo }: { onUndo: () => void }) {
  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="solidarity">
      <div className={styles.farewell}>
        <div className={styles.farewellIc}>
          <FiHeart />
        </div>
        <h2
          className={styles.h1}
          style={{ margin: "0 auto 10px", fontSize: 36 }}
        >
          You're on the <em>solidarity rate.</em>
        </h2>
        <p className={styles.fwLead}>
          From your next renewal you'll pay <b>€12/year</b> — and you keep{" "}
          <b>every Sustainer perk</b> exactly as it is now. The community fund
          covers the rest.
        </p>
        <p className={styles.fwLead}>
          Your next charge is <b>€12 on 6 Jun 2027</b>. We sent the details to{" "}
          <b>{currentUserEmail}</b>.
        </p>
        <p className={styles.fwNote}>
          When things ease up, you can move back to the full rate any time — no
          pressure, no reminder.
        </p>
        <div className={styles.farewellBtns}>
          <Button variant="primary" to={routes.membership}>
            Back to membership
          </Button>
          <Button variant="ghost" onClick={onUndo}>
            Undo
          </Button>
        </div>
      </div>
    </div>
  );
}
