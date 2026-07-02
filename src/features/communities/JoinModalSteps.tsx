import { Button } from "../../shared/components/ui";
import { INVOLVEMENT } from "./joinModal.data";
import type { JoinModalCommunity } from "./JoinModal";
import styles from "./JoinModal.module.css";

export function JoinStepIntro({
  community,
  isRequest,
  isInvite,
  inviteCode,
  setInviteCode,
  onNext,
}: {
  community: JoinModalCommunity;
  isRequest: boolean;
  isInvite: boolean;
  inviteCode: string;
  setInviteCode: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div className={styles.eye}>
        {isRequest
          ? "Asking to join"
          : isInvite
            ? "Joining with an invitation"
            : "Joining"}
      </div>
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
      {isInvite && (
        <div className={styles.fields}>
          <input
            className={styles.input}
            type="text"
            placeholder="Enter your invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
        </div>
      )}
      <Button
        variant="primary"
        onClick={onNext}
        disabled={isInvite && !inviteCode.trim()}
      >
        {isInvite ? "Verify & continue" : "Continue"}
      </Button>
    </div>
  );
}

export function JoinStepAbout({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <div className={styles.eye}>A bit about you</div>
      <div className={styles.title}>How should the community know you?</div>
      <p className={styles.hint}>
        Optional — a little context helps people know who you are.
      </p>
      <div className={styles.fields}>
        <input className={styles.input} type="text" placeholder="Your name" />
        <input
          className={styles.input}
          type="text"
          placeholder="Pronouns, if you'd like to share"
        />
        <textarea
          className={styles.textarea}
          rows={3}
          placeholder="A sentence about yourself — what brings you here?"
        />
      </div>
      <Button variant="primary" onClick={onNext}>
        Continue
      </Button>
    </div>
  );
}

export function JoinStepInvolvement({
  isRequest,
  involvement,
  setInvolvement,
  onSubmit,
}: {
  isRequest: boolean;
  involvement: string;
  setInvolvement: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div>
      <div className={styles.eye}>Almost done</div>
      <div className={styles.title}>How would you like to be involved?</div>
      <div className={styles.fields}>
        <input
          className={styles.input}
          type="email"
          placeholder="Your email address"
        />
        <div>
          <div className={styles.invLabel}>Level of involvement</div>
          <div className={styles.opts}>
            {INVOLVEMENT.map((o) => (
              <label
                key={o.value}
                className={[
                  styles.opt,
                  involvement === o.value && styles.optChecked,
                ]
                  .filter(Boolean)
                  .join(" ")}
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
      <Button variant="primary" onClick={onSubmit}>
        {isRequest ? "Send request" : "Join the community"}
      </Button>
    </div>
  );
}

export function JoinStepDone({
  community,
  isRequest,
  onClose,
}: {
  community: JoinModalCommunity;
  isRequest: boolean;
  onClose: () => void;
}) {
  return (
    <div>
      <div className={styles.successIcon}>
        <svg viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className={styles.title}>
        {isRequest
          ? "Your request is with the mods"
          : `Welcome to ${community.name}`}
      </div>
      <p className={styles.desc}>
        {isRequest ? (
          <>
            Thanks — the mods of <strong>{community.name}</strong> will read
            your request and welcome you in. We'll let you know either way.
          </>
        ) : (
          <>
            You're part of <strong>{community.name}</strong> now. Someone will
            be in touch to help you find your footing.
          </>
        )}
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
