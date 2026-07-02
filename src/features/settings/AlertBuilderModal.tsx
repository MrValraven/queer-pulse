import { useState } from "react";
import { FiBell, FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import styles from "./SettingsModal.module.css";

export interface AlertDraft {
  id: string;
  title: string;
  keywords: string;
  location: string;
  minSalary: string;
  frequency: string;
}

const FREQUENCIES = ["Instant alerts", "Daily digest", "Weekly digest"];
const LOCATIONS = ["Lisbon", "Remote (PT)", "Anywhere", "Porto", "Berlin"];

/**
 * Create / edit a saved-search job alert. Pre-filled when `initial` is given.
 * Saving reports the draft back to the page; success shows a plum panel.
 */
export function AlertBuilderModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: AlertDraft;
  onClose: () => void;
  onSave: (draft: AlertDraft) => void;
}) {
  const editing = Boolean(initial);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [keywords, setKeywords] = useState(initial?.keywords ?? "");
  const [location, setLocation] = useState(initial?.location ?? LOCATIONS[0]!);
  const [minSalary, setMinSalary] = useState(initial?.minSalary ?? "");
  const [frequency, setFrequency] = useState(
    initial?.frequency ?? FREQUENCIES[2]!,
  );
  const [done, setDone] = useState(false);
  useScrollLock();

  const valid = title.trim().length > 0 && keywords.trim().length > 0;

  function save() {
    if (!valid) return;
    onSave({
      id: initial?.id ?? `alert-${Date.now()}`,
      title: title.trim(),
      keywords: keywords.trim(),
      location,
      minSalary: minSalary.trim(),
      frequency,
    });
    setDone(true);
  }

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
        aria-label={editing ? "Edit alert" : "New saved search"}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {!done ? (
          <>
            <div className={styles.eye}>
              {editing ? "Edit alert" : "New saved search"}
            </div>
            <div className={styles.title}>
              {editing ? "Tune your " : "Build a "}
              <em>job alert.</em>
            </div>
            <p className={styles.desc}>
              We’ll match new listings against your criteria and send them on
              your chosen cadence.
            </p>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Alert name <span className={styles.req}>*</span>
                </label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. Designer roles · Lisbon"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  Title keywords <span className={styles.req}>*</span>
                </label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. Designer · senior · mid"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
                <span className={styles.hint}>
                  Comma-separated. Matches any of these.
                </span>
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Location</label>
                  <select
                    className={styles.select}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Min salary</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="e.g. €32k"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>How often</label>
                <select
                  className={styles.select}
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.actions}>
              <Button variant="primary" onClick={save} disabled={!valid}>
                {editing ? "Save changes" : "Create alert"}
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              {editing ? <FiCheck size={28} /> : <FiBell size={26} />}
            </div>
            <div className={styles.successTitle}>
              {editing ? (
                <>
                  Alert <em>updated.</em>
                </>
              ) : (
                <>
                  Alert <em>created.</em>
                </>
              )}
            </div>
            <p className={styles.successSub}>
              “{title.trim()}” is live on a {frequency.toLowerCase()}. We’ll let
              you know the moment a matching role appears.
            </p>
            <div className={styles.successActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
