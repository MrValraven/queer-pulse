import { useState } from "react";
import { FiChevronDown, FiX } from "react-icons/fi";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { EVENT_ARRIVAL_DATE, FIRST_TIMER_STEPS } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function FirstTimerCard() {
  const { firstTimerDismissed, dismissFirstTimer } = useCheckout();
  const { t } = useTranslation();
  const fmt = useFormat();
  const [open, setOpen] = useState(false);

  if (firstTimerDismissed) return null;

  return (
    <div className={cx(s["co-firsttimer"], open && s.open)}>
      <button
        className={s["co-ft-dismiss"]}
        type="button"
        onClick={dismissFirstTimer}
        aria-label={t("gatherings:checkout.firstTimer.dismissAria")}
      >
        <FiX />
      </button>
      <div className={s["co-ft-top"]}>
        <span className={s["co-ft-badge"]}>
          {t("gatherings:checkout.firstTimer.badge")}
        </span>
        <span className={s["co-ft-h"]}>
          {t("gatherings:checkout.firstTimer.heading")}
        </span>
        <button
          className={s["co-ft-toggle"]}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open
            ? t("gatherings:checkout.firstTimer.seeLess")
            : t("gatherings:checkout.firstTimer.seeMore")}{" "}
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
              <div className={s["co-ft-step-t"]}>{t(step.titleKey)}</div>
              <div className={s["co-ft-step-p"]}>
                {t(step.bodyKey, { time: fmt.time(EVENT_ARRIVAL_DATE) })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
