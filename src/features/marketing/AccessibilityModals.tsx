import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { FLAG_ISSUES } from "./accessibility.data";
import styles from "./AccessibilityPage.module.css";

const Check = () => (
  <svg
    viewBox="0 0 26 26"
    fill="none"
    stroke="var(--jade)"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 13l6 6L22 7" />
  </svg>
);

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  useScrollLock();
  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <button type="button" className={styles.modalX} onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export function FlagVenueModal({
  venue,
  onClose,
}: {
  venue: string;
  onClose: () => void;
}) {
  const [done, setDone] = useState(false);
  return (
    <ModalShell onClose={onClose}>
      {done ? (
        <div className={styles.success}>
          <div className={styles.sucIcon}>
            <Check />
          </div>
          <h2>
            Flag <em>received.</em>
          </h2>
          <p>
            Thank you. We'll follow up with the venue and update the listing
            within two weeks.
          </p>
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.modalTitle}>Flag an accessibility issue</div>
          <p className={styles.modalSub}>
            Tell us what you experienced. We'll follow up with the venue and
            update the listing. Your name is not shared with the venue.
          </p>
          <div className={styles.fields}>
            <div>
              <label className={styles.fieldLabel}>Venue</label>
              <input
                className={styles.input}
                type="text"
                value={venue}
                readOnly
              />
            </div>
            <div>
              <label className={styles.fieldLabel}>Type of issue</label>
              <select className={styles.select} defaultValue="">
                <option value="">Select…</option>
                {FLAG_ISSUES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.fieldLabel}>What happened</label>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="Describe what you experienced. Be specific — it helps us follow up accurately."
              />
            </div>
            <div>
              <label className={styles.fieldLabel}>When did this happen?</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Approximate date or event name"
              />
            </div>
          </div>
          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="primary"
              onClick={() => setDone(true)}
            >
              Submit flag
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

export function AccommodationsModal({ onClose }: { onClose: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <ModalShell onClose={onClose}>
      {done ? (
        <div className={styles.success}>
          <div className={styles.sucIcon}>
            <Check />
          </div>
          <h2>
            Request <em>sent.</em>
          </h2>
          <p>
            We'll confirm what we can arrange, usually within 48 hours. Thank
            you for letting us know.
          </p>
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.modalTitle}>Request accommodations</div>
          <p className={styles.modalSub}>
            Tell us what you need for an upcoming QueerPulse event. We'll
            confirm what we can arrange and be honest about what we can't.
          </p>
          <div className={styles.fields}>
            <div>
              <label className={styles.fieldLabel}>Your name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="First name or nickname"
              />
            </div>
            <div>
              <label className={styles.fieldLabel}>Event (if specific)</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Event name or date, or 'all upcoming events'"
              />
            </div>
            <div>
              <label className={styles.fieldLabel}>What you need</label>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="Tell us what would make the event accessible for you. You don't need to justify it or share your diagnosis — just describe what you need."
              />
            </div>
            <div>
              <label className={styles.fieldLabel}>How to reach you</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Email or QueerPulse username"
              />
            </div>
          </div>
          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="primary"
              onClick={() => setDone(true)}
            >
              Send request
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
