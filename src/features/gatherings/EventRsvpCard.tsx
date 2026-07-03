import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { TIERS } from "./eventPage.data";
import { EVENT_CAPACITY, EVENT_IS_FULL } from "./eventRsvp.data";
import { WaitlistSuccess, ReservedSuccess } from "./EventRsvpSuccess";
import { useRsvp, useUnrsvp } from "./api/useEventMutations";
import styles from "./EventPage.module.css";

/** The static EventPage has no live id, so a stable placeholder slug keeps the
 *  demo no-op path working and gives live mode a slug to target. */
export function EventRsvpCard({ slug = "welcome-dinner" }: { slug?: string }) {
  const navigate = useNavigate();
  const rsvp = useRsvp(slug);
  const unrsvp = useUnrsvp(slug);
  const [selectedTier, setSelectedTier] = useState(1);
  const [reserved, setReserved] = useState(false);
  const [waitlistPos, setWaitlistPos] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const canSubmit = fullName.trim().length > 0 && emailValid;
  const isFull = EVENT_IS_FULL;

  function joinWaitlist() {
    rsvp.mutate("maybe");
    // Plausible position derived from the name length for this prototype.
    setWaitlistPos(2 + (fullName.trim().length % 5));
  }

  if (waitlistPos !== null) {
    return (
      <WaitlistSuccess
        waitlistPos={waitlistPos}
        email={email}
        onLeave={() => {
          unrsvp.mutate();
          setWaitlistPos(null);
        }}
      />
    );
  }

  return (
    <div className={styles.ticketCard}>
      {reserved ? (
        <ReservedSuccess
          selectedTier={selectedTier}
          email={email}
          onCancel={() => {
            unrsvp.mutate();
            setReserved(false);
          }}
        />
      ) : (
        <>
          <div className={styles.ticketHead}>
            <div className={styles.ticketHeadTitle}>
              {isFull ? "This gathering is full" : "Reserve your place"}
            </div>
            <div className={styles.ticketHeadSub}>
              {isFull
                ? "Join the waitlist — we'll email you if a spot opens."
                : "Pay what you can. All tiers include everything."}
            </div>
          </div>
          <div className={styles.spotsText}>
            {isFull ? (
              <span>
                <strong>0 spots</strong> remaining
              </span>
            ) : (
              <span>
                <strong>5 spots</strong> remaining
              </span>
            )}
            <span>
              {isFull
                ? `${EVENT_CAPACITY} of ${EVENT_CAPACITY} filled`
                : `21 of ${EVENT_CAPACITY} filled`}
            </span>
          </div>
          <div className={styles.spotsBar}>
            <div
              className={styles.spotsFill}
              style={{ width: isFull ? "100%" : "81%" }}
            />
          </div>
          {!isFull && (
            <div className={styles.tiers}>
              {TIERS.map((tier, index) => (
                <button
                  type="button"
                  key={tier.name}
                  className={[
                    styles.tier,
                    selectedTier === index && styles.tierSelected,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSelectedTier(index)}
                >
                  <span className={styles.tierRadio} />
                  <span style={{ flex: 1 }}>
                    <span
                      className={styles.tierName}
                      style={{ display: "block" }}
                    >
                      {tier.name}
                    </span>
                    <span className={styles.tierDesc}>{tier.desc}</span>
                  </span>
                  <span className={styles.tierPrice}>{tier.price}</span>
                </button>
              ))}
            </div>
          )}
          <div className={styles.form}>
            <input
              className={styles.input}
              type="text"
              inputMode="text"
              autoComplete="name"
              autoCapitalize="words"
              placeholder="Your name *"
              required
              aria-required="true"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              className={styles.input}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Your email *"
              required
              aria-required="true"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!isFull && (
              <input
                className={styles.input}
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="Dietary requirements (optional)"
              />
            )}
            <div className={styles.requiredHint}>
              <span className={styles.req}>*</span> Name and email are required
              — we send your {isFull ? "waitlist update" : "confirmation"}{" "}
              there.
            </div>
            <button
              type="button"
              className={styles.rsvpBtn}
              onClick={() => {
                if (isFull) {
                  joinWaitlist();
                } else {
                  rsvp.mutate("going");
                  navigate(routes.checkout);
                }
              }}
              disabled={!canSubmit}
              title={
                !canSubmit
                  ? "Enter your name and a valid email to continue"
                  : undefined
              }
            >
              {isFull ? "Join the waitlist →" : "Reserve my place →"}
            </button>
          </div>
          <div className={styles.note}>
            {isFull
              ? "We'll email you the moment a spot opens. Leaving the waitlist is one click."
              : "You'll receive a confirmation email. You can cancel up to 48 hours before the event."}
          </div>
        </>
      )}
    </div>
  );
}
