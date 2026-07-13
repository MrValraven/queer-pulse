import { useState } from "react";
import { FiLock } from "react-icons/fi";
import { Button, Modal, Toggle } from "../ui";
import type { ConsentCategories } from "../../api/consent.api";
import styles from "./Consent.module.css";

interface Row {
  key: "analytics" | "monitoring";
  title: string;
  desc: string;
}

const ROWS: Row[] = [
  {
    key: "analytics",
    title: "Analytics & usage",
    desc: "Anonymous, aggregate patterns — which pages help, which fall flat. No individual tracking, no ad networks. Off unless you turn it on.",
  },
  {
    key: "monitoring",
    title: "Error & crash reporting",
    desc: "Automatic diagnostics when something breaks, so we can fix it faster. Carries no advertising or profiling data.",
  },
];

/**
 * The preference center — one toggle per opt-in category plus a locked, always-on
 * "Strictly necessary" row. Reject is exactly as easy as accept: both save the
 * exact toggle state. Reuses the shared focus-managed <Modal>.
 */
export function ConsentPreferences({
  consent,
  onSave,
  onClose,
}: {
  consent: ConsentCategories;
  onSave: (next: { analytics: boolean; monitoring: boolean }) => void;
  onClose: () => void;
}) {
  const [state, setState] = useState({
    analytics: consent.analytics,
    monitoring: consent.monitoring,
  });

  return (
    <Modal
      eyebrow="Privacy"
      title={
        <>
          Your <em>choices.</em>
        </>
      }
      sub="Necessary cookies keep you logged in and safe — they're always on. Everything else is up to you, and you can change it any time."
      onClose={onClose}
      footer={
        <div className={styles.prefsFoot}>
          <Button
            variant="ghost"
            onClick={() => setState({ analytics: false, monitoring: false })}
          >
            Reject non-essential
          </Button>
          <Button variant="primary" onClick={() => onSave(state)}>
            Save choices
          </Button>
        </div>
      }
    >
      <div className={styles.prefsList}>
        <div className={`${styles.prefRow} ${styles.prefRowLocked}`}>
          <div className={styles.prefText}>
            <div className={styles.prefTitle}>Strictly necessary</div>
            <div className={styles.prefDesc}>
              Your session and CSRF cookies, plus theme and language stored on
              your device. Required to run the platform — never used to track
              you.
            </div>
          </div>
          <span className={styles.prefLock} aria-label="Always on">
            <FiLock aria-hidden />
          </span>
        </div>

        {ROWS.map((r) => (
          <div key={r.key} className={styles.prefRow}>
            <div className={styles.prefText}>
              <div className={styles.prefTitle}>{r.title}</div>
              <div className={styles.prefDesc}>{r.desc}</div>
            </div>
            <Toggle
              tone="coral"
              label={r.title}
              checked={state[r.key]}
              onChange={(v) => setState((s) => ({ ...s, [r.key]: v }))}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
}
