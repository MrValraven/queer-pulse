import { useState } from "react";
import { FiChevronDown, FiX } from "react-icons/fi";
import { FIRST_TIMER_STEPS } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function FirstTimerCard() {
  const { firstTimerDismissed, dismissFirstTimer } = useCheckout();
  const [open, setOpen] = useState(false);

  if (firstTimerDismissed) return null;

  return (
    <div className={cx(s["co-firsttimer"], open && s.open)}>
      <button
        className={s["co-ft-dismiss"]}
        type="button"
        onClick={dismissFirstTimer}
        aria-label="Dismiss"
      >
        <FiX />
      </button>
      <div className={s["co-ft-top"]}>
        <span className={s["co-ft-badge"]}>First supper?</span>
        <span className={s["co-ft-h"]}>Here's how the night flows</span>
        <button
          className={s["co-ft-toggle"]}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? "See less" : "See more"}{" "}
          <span className={s["co-ft-chev"]} aria-hidden>
            <FiChevronDown />
          </span>
        </button>
      </div>
      <div className={s["co-ft-body"]}>
        <div className={s["co-ft-steps"]}>
          {FIRST_TIMER_STEPS.map((step) => (
            <div key={step.n} className={s["co-ft-step"]}>
              <div className={s["co-ft-step-n"]}>{step.n}</div>
              <div className={s["co-ft-step-t"]}>{step.title}</div>
              <div className={s["co-ft-step-p"]}>{step.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
