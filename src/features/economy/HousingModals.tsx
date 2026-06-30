import { useState, type ReactNode } from "react";
import { FiStar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import styles from "./housingModals.module.css";

const Check = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function Shell({
  children,
  onClose,
}: {
  children: ReactNode;
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
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className={styles.scroll}>{children}</div>
      </div>
    </div>
  );
}

/* ---- Message the lister ---- */
export function MessageModal({
  toName,
  listingTitle,
  responseTime,
  onClose,
}: {
  toName: string;
  listingTitle: string;
  responseTime: string;
  onClose: () => void;
}) {
  const [text, setText] = useState(
    `Hi ${toName.split(" ")[0]}, I'm interested in "${listingTitle}". Is it still available? A bit about me: `,
  );
  const [done, setDone] = useState(false);
  const canSend = text.trim().length >= 20;

  return (
    <Shell onClose={onClose}>
      {done ? (
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <Check />
          </div>
          <div className={styles.title}>
            Message <em>sent.</em>
          </div>
          <p className={styles.sub}>
            Your message is on its way to <strong>{toName}</strong>, who usually
            replies <strong>{responseTime}</strong>. You'll get a notification
            here when they do. Contact details are shared once you both agree to
            take it further.
          </p>
          <div className={styles.actions}>
            <Button variant="ghost" className={styles.full} onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className={styles.eye}>Message the lister</div>
          <div className={styles.title}>
            Message <em>{toName}</em>
          </div>
          <p className={styles.sub}>
            About <strong>{listingTitle}</strong>. Keep it human — a sentence
            about who you are and why it suits you goes a long way. Your profile
            is shared with the message.
          </p>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className={styles.counter}>
            {text.trim().length < 20
              ? `${20 - text.trim().length} more characters to send`
              : `${text.trim().length} characters`}
          </div>
          <div className={styles.note}>
            For your safety, keep the conversation on QueerPulse until you've
            met. Never send a deposit before viewing the place in person.
          </div>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className={styles.full}
              onClick={() => setDone(true)}
              disabled={!canSend}
            >
              Send message
            </Button>
          </div>
        </div>
      )}
    </Shell>
  );
}

/* ---- Recommend a landlord ---- */
export function RecommendModal({
  landlordName,
  onClose,
  onSubmitted,
}: {
  landlordName: string;
  onClose: () => void;
  onSubmitted?: (stars: number, text: string) => void;
}) {
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const canSubmit = text.trim().length >= 20;

  const submit = () => {
    if (!canSubmit) return;
    onSubmitted?.(stars, text.trim());
    setDone(true);
  };

  return (
    <Shell onClose={onClose}>
      {done ? (
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <Check />
          </div>
          <div className={styles.title}>
            Thank you. <em>Recorded.</em>
          </div>
          <p className={styles.sub}>
            Your recommendation for <strong>{landlordName}</strong> will appear
            once a moderator has confirmed you've rented from them — it's how
            the board stays trustworthy. This is the kind of thing that makes
            someone's move so much safer.
          </p>
          <div className={styles.actions}>
            <Button variant="ghost" className={styles.full} onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className={styles.eye}>Recommend a landlord</div>
          <div className={styles.title}>
            Recommend <em>{landlordName}</em>
          </div>
          <p className={styles.sub}>
            You've rented from them and it went well. Tell other members what to
            expect — the specific, useful things you wish you'd known.
          </p>

          <div className={styles.label}>Your rating</div>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={[styles.star, n <= stars && styles.starOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setStars(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                <FiStar />
              </button>
            ))}
          </div>

          <div className={styles.label}>What should members know?</div>
          <textarea
            className={styles.textarea}
            placeholder="How were repairs, contracts, deposits? Did they respect your privacy and your relationships? Specifics help."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className={styles.counter}>
            {text.trim().length < 20
              ? `${20 - text.trim().length} more characters to submit`
              : `${text.trim().length} characters`}
          </div>
          <div className={styles.note}>
            Recommendations are checked before they appear. Only recommend
            landlords you've actually rented from.
          </div>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className={styles.full}
              onClick={submit}
              disabled={!canSubmit}
            >
              Submit recommendation
            </Button>
          </div>
        </div>
      )}
    </Shell>
  );
}
