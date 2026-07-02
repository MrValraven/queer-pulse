import { useEffect, useState, type ReactNode } from "react";
import { FiCheck, FiDownload, FiLoader } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import styles from "./SettingsModal.module.css";

/** Shared modal shell with overlay click-to-close, ESC and a close button. */
function ModalShell({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className={styles.spin}>
      <FiLoader size={16} />
    </span>
  );
}

/** Plum-panel success state shown after a simulated submission. */
function SuccessPanel({
  title,
  children,
  onClose,
}: {
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <FiCheck size={28} />
      </div>
      <div className={styles.successTitle}>{title}</div>
      <p className={styles.successSub}>{children}</p>
      <div className={styles.successActions}>
        <Button variant="ghost-dark" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}

type Phase = "form" | "saving" | "done";

/* ── Email change ─────────────────────────────────────────────────── */
export function EmailChangeModal({
  currentEmail,
  onClose,
}: {
  currentEmail: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("form");
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");
  const valid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    email === confirm &&
    email !== currentEmail;

  useEffect(() => {
    if (phase !== "saving") return;
    const t = setTimeout(() => setPhase("done"), 1200);
    return () => clearTimeout(t);
  }, [phase]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setPhase("saving");
  }

  return (
    <ModalShell label="Change your email" onClose={onClose}>
      {phase === "done" ? (
        <SuccessPanel
          title={
            <>
              Almost <em>there.</em>
            </>
          }
          onClose={onClose}
        >
          We've sent a confirmation link to <strong>{email}</strong>. Click it
          to finish moving your account email. Until then, you'll keep signing
          in with {currentEmail}.
        </SuccessPanel>
      ) : (
        <form onSubmit={submit}>
          <div className={styles.eye}>Account · email</div>
          <h2 className={styles.title}>
            Change your <em>email.</em>
          </h2>
          <p className={styles.desc}>
            Currently <strong>{currentEmail}</strong>. We'll send a confirmation
            link to the new address before anything changes.
          </p>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="new-email">
                New email <span className={styles.req}>*</span>
              </label>
              <input
                id="new-email"
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirm-email">
                Confirm new email <span className={styles.req}>*</span>
              </label>
              <input
                id="confirm-email"
                type="email"
                className={styles.input}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat new email"
                required
              />
              {confirm.length > 0 && confirm !== email && (
                <span className={styles.hint}>
                  The two emails don't match yet.
                </span>
              )}
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              type="submit"
              disabled={!valid || phase === "saving"}
            >
              {phase === "saving" ? (
                <>
                  <Spinner /> Sending…
                </>
              ) : (
                "Send confirmation"
              )}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={onClose}
              disabled={phase === "saving"}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

/* ── Password change ──────────────────────────────────────────────── */
export function PasswordChangeModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>("form");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const tooShort = next.length > 0 && next.length < 8;
  const mismatch = confirm.length > 0 && confirm !== next;
  const valid = current.length > 0 && next.length >= 8 && next === confirm;

  useEffect(() => {
    if (phase !== "saving") return;
    const t = setTimeout(() => setPhase("done"), 1200);
    return () => clearTimeout(t);
  }, [phase]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setPhase("saving");
  }

  return (
    <ModalShell label="Change your password" onClose={onClose}>
      {phase === "done" ? (
        <SuccessPanel
          title={
            <>
              Password <em>updated.</em>
            </>
          }
          onClose={onClose}
        >
          Your new password is live. You'll stay signed in here, but you'll need
          the new password on any other device.
        </SuccessPanel>
      ) : (
        <form onSubmit={submit}>
          <div className={styles.eye}>Account · security</div>
          <h2 className={styles.title}>
            Change your <em>password.</em>
          </h2>
          <p className={styles.desc}>
            Choose something at least 8 characters long. We'll sign you out of
            other devices.
          </p>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="cur-pw">
                Current password <span className={styles.req}>*</span>
              </label>
              <input
                id="cur-pw"
                type="password"
                className={styles.input}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="new-pw">
                New password <span className={styles.req}>*</span>
              </label>
              <input
                id="new-pw"
                type="password"
                className={styles.input}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
              />
              {tooShort && (
                <span className={styles.hint}>At least 8 characters.</span>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="conf-pw">
                Confirm new password <span className={styles.req}>*</span>
              </label>
              <input
                id="conf-pw"
                type="password"
                className={styles.input}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              {mismatch && (
                <span className={styles.hint}>Passwords don't match yet.</span>
              )}
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              type="submit"
              disabled={!valid || phase === "saving"}
            >
              {phase === "saving" ? (
                <>
                  <Spinner /> Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={onClose}
              disabled={phase === "saving"}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

/* ── Suggest an edit (terminology) ────────────────────────────────── */
export function SuggestEditModal({
  term,
  onClose,
}: {
  term: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("form");
  const [suggestion, setSuggestion] = useState("");
  const [why, setWhy] = useState("");
  const valid = suggestion.trim().length > 2;

  useEffect(() => {
    if (phase !== "saving") return;
    const t = setTimeout(() => setPhase("done"), 1100);
    return () => clearTimeout(t);
  }, [phase]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setPhase("saving");
  }

  return (
    <ModalShell label={`Suggest an edit to ${term}`} onClose={onClose}>
      {phase === "done" ? (
        <SuccessPanel
          title={
            <>
              Thank you — <em>noted.</em>
            </>
          }
          onClose={onClose}
        >
          Your suggested edit to <strong>{term}</strong> is with our community
          editors. Terminology changes are reviewed before going live; we'll let
          you know what happens.
        </SuccessPanel>
      ) : (
        <form onSubmit={submit}>
          <div className={styles.eye}>Terminology · suggest an edit</div>
          <h2 className={styles.title}>
            Refine <em>{term}.</em>
          </h2>
          <p className={styles.desc}>
            This guide is edited by the community. Suggest a clearer wording or
            a correction — every change is reviewed before publishing.
          </p>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="sugg">
                Your suggested wording <span className={styles.req}>*</span>
              </label>
              <textarea
                id="sugg"
                className={styles.input}
                rows={3}
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder={`A clearer definition of "${term}"…`}
                autoFocus
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="why">
                Why change it? <span className={styles.hint}>(optional)</span>
              </label>
              <textarea
                id="why"
                className={styles.input}
                rows={2}
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                placeholder="Context that helps the editors"
              />
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              type="submit"
              disabled={!valid || phase === "saving"}
            >
              {phase === "saving" ? (
                <>
                  <Spinner /> Sending…
                </>
              ) : (
                "Send suggestion"
              )}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={onClose}
              disabled={phase === "saving"}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

/* ── Data export (simulated, with mock Blob download) ─────────────── */
export function DataExportModal({
  title,
  filename,
  payload,
  onClose,
}: {
  title: string;
  filename: string;
  payload: Record<string, unknown>;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"preparing" | "ready">("preparing");

  // Kick off the simulated export as soon as the modal mounts.
  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 1500);
    return () => clearTimeout(t);
  }, []);

  function download() {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <ModalShell label={title} onClose={onClose}>
      {phase === "preparing" ? (
        <div style={{ textAlign: "center", padding: "20px 8px" }}>
          <div className={styles.eye}>Data &amp; privacy</div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.desc}>
            Gathering your data and packaging it as a JSON file. This usually
            takes a moment…
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              color: "var(--plum)",
            }}
          >
            <Spinner />
          </div>
        </div>
      ) : (
        <SuccessPanel
          title={
            <>
              Your export is <em>ready.</em>
            </>
          }
          onClose={onClose}
        >
          We've packaged your data as <strong>{filename}</strong>. In the real
          product we'd also email you a secure link — here you can download it
          now.
          <span style={{ display: "block", marginTop: 18 }}>
            <Button variant="jade" onClick={download}>
              <FiDownload style={{ verticalAlign: "-2px", marginRight: 8 }} />
              Download {filename}
            </Button>
          </span>
        </SuccessPanel>
      )}
    </ModalShell>
  );
}
