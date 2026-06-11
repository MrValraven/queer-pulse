import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import styles from "./JoinModal.module.css";

export interface JoinModalCommunity {
  name: string;
  typeLabel: string;
  count: string;
  description: string;
  tags?: string[];
}

const INVOLVEMENT = [
  { value: "updates", label: "Keep me updated", desc: "News and events only — no commitment" },
  { value: "active", label: "Active member", desc: "Come to events and join the group" },
  { value: "organise", label: "Help organise", desc: "Volunteer to help run things" },
];

export function JoinModal({
  community,
  onClose,
  onJoined,
}: {
  community: JoinModalCommunity;
  onClose: () => void;
  onJoined?: () => void;
}) {
  const [step, setStep] = useState(1);
  const [involvement, setInvolvement] = useState("active");
  useScrollLock();

  const total = 3;
  const done = step > total;
  const fill = done ? 100 : (step / total) * 100;

  const submit = () => {
    setStep(4);
    onJoined?.();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        {!done && (
          <div className={styles.progress}>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ width: `${fill}%` }} />
            </div>
            <div className={styles.progressLabel}>Step {step} of {total}</div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className={styles.eye}>You're joining</div>
            <div className={styles.title}>{community.name}</div>
            <div className={styles.meta}>
              {community.typeLabel} · {community.count}
            </div>
            <p className={styles.desc}>{community.description}</p>
            {community.tags && community.tags.length > 0 && (
              <div className={styles.tags}>
                {community.tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            <Button variant="primary" onClick={() => setStep(2)}>
              Sounds good — continue →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className={styles.eye}>A bit about you</div>
            <div className={styles.title}>How should the community know you?</div>
            <p className={styles.hint}>
              Optional — but it helps the community welcome you properly.
            </p>
            <div className={styles.fields}>
              <input className={styles.input} type="text" placeholder="Your name" />
              <input className={styles.input} type="text" placeholder="Your pronouns (optional)" />
              <textarea className={styles.textarea} rows={3} placeholder="A sentence about yourself — what brings you here?" />
            </div>
            <Button variant="primary" onClick={() => setStep(3)}>
              Continue →
            </Button>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className={styles.eye}>Almost done</div>
            <div className={styles.title}>How would you like to be involved?</div>
            <div className={styles.fields}>
              <input className={styles.input} type="email" placeholder="Your email address" />
              <div>
                <div className={styles.invLabel}>Level of involvement</div>
                <div className={styles.opts}>
                  {INVOLVEMENT.map((o) => (
                    <label
                      key={o.value}
                      className={[styles.opt, involvement === o.value && styles.optChecked].filter(Boolean).join(" ")}
                    >
                      <input
                        type="radio"
                        name="involvement"
                        value={o.value}
                        checked={involvement === o.value}
                        onChange={() => setInvolvement(o.value)}
                      />
                      <div>
                        <span>{o.label}</span>
                        <small>{o.desc}</small>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <Button variant="primary" onClick={submit}>
              Join the community →
            </Button>
          </div>
        )}

        {done && (
          <div>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className={styles.title}>You're in!</div>
            <p className={styles.desc}>
              Welcome to <strong>{community.name}</strong>. We'll send you a confirmation
              and connect you with the community coordinators shortly.
            </p>
            <div className={styles.actions}>
              <Button variant="ghost" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
