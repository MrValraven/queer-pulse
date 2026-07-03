import { useState } from "react";
import { Button } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { MAX_SEATS } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { validEmail } from "./checkout.validation";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function SeatQuantity() {
  const { qty, changeQty } = useCheckout();
  const { showToast } = useToast();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [wlEmail, setWlEmail] = useState("");
  const [wlInvalid, setWlInvalid] = useState(false);

  function joinWaitlist() {
    if (!validEmail(wlEmail.trim())) {
      setWlInvalid(true);
      return;
    }
    setWlInvalid(false);
    setWaitlistOpen(false);
    showToast(
      "You're on the waitlist — we'll email you the moment a seat opens.",
      "success",
    );
  }

  return (
    <>
      <div className={s["co-qty-row"]}>
        <div>
          <div className={s["co-qty-lbl"]}>Seats</div>
          <div className={s["co-qty-sub"]}>
            {qty > 1
              ? "You'll add each guest's name & dietary needs below."
              : "Bringing a +1? Add their details below."}
          </div>
        </div>
        <div
          className={s["co-stepper"]}
          role="group"
          aria-label="Number of seats"
        >
          <button
            className={s["co-step-btn"]}
            type="button"
            onClick={() => changeQty(-1)}
            disabled={qty <= 1}
            aria-label="Remove a seat"
          >
            −
          </button>
          <span className={s["co-qty-val"]} aria-live="polite">
            {qty}
          </span>
          <button
            className={s["co-step-btn"]}
            type="button"
            onClick={() => changeQty(1)}
            disabled={qty >= MAX_SEATS}
            aria-label="Add a seat"
          >
            +
          </button>
        </div>
      </div>

      <div className={s["co-waitlist-link"]}>
        Want more than 2 seats, or a future date?{" "}
        <button type="button" onClick={() => setWaitlistOpen((o) => !o)}>
          Join the waitlist
        </button>
      </div>

      <div className={cx(s["co-waitlist"], waitlistOpen && s.show)}>
        <div className={s["co-waitlist-h"]}>Join the waitlist</div>
        <div className={s["co-waitlist-p"]}>
          We'll email you the moment a seat opens here — or when Tomás schedules
          the next supper. No payment now.
        </div>
        <div className={s["co-grid-2"]}>
          <div className={s["co-field"]}>
            <label className={s["co-lbl"]} htmlFor="wlEmail">
              Email
            </label>
            <input
              className={cx(s["co-in"], wlInvalid && s.invalid)}
              id="wlEmail"
              type="email"
              inputMode="email"
              value={wlEmail}
              onChange={(e) => setWlEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className={s["co-field"]}>
            <label className={s["co-lbl"]} htmlFor="wlSize">
              Party size
            </label>
            <select className={s["co-select"]} id="wlSize">
              <option>1 seat</option>
              <option>2 seats</option>
              <option>3 seats</option>
              <option>4 seats</option>
            </select>
          </div>
        </div>
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}
        >
          <Button
            variant="primary"
            onClick={joinWaitlist}
            style={{ padding: "10px 20px" }}
          >
            Add me to the list →
          </Button>
        </div>
      </div>
    </>
  );
}
