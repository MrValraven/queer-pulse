import { FiCalendar, FiCreditCard, FiGift, FiMapPin } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { routes } from "../../../app/routeMap";
import { TIMELINE } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { downloadIcs, googleCalendarUrl } from "./calendar";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function ConfirmationNext() {
  const { ref, reminders, toggleReminder } = useCheckout();
  const { showToast } = useToast();
  const noReminders = !reminders.email && !reminders.sms;

  function copyShare() {
    const link = "https://queerpulse.pt/gathering/supper-club-13";
    navigator.clipboard
      ?.writeText(link)
      .then(() =>
        showToast("Link copied — share it with a friend.", "success"),
      );
  }

  return (
    <>
      <div className={s["co-sec"]}>What happens next</div>
      <div className={s["co-timeline"]}>
        {TIMELINE.map((item) => (
          <div
            key={item.when}
            className={cx(s["co-tl-item"], item.future && s.future)}
          >
            <div className={s["co-tl-dot"]} />
            <div className={s["co-tl-when"]}>{item.when}</div>
            <div className={s["co-tl-t"]}>{item.title}</div>
            <div className={s["co-tl-p"]}>{item.body}</div>
          </div>
        ))}
      </div>

      <div className={s["co-sec"]}>Roughly where</div>
      <div
        className={s["co-map"]}
        role="img"
        aria-label="Approximate location in Mouraria, Lisbon"
      >
        <div className={s["co-map-blur"]} />
        <div className={s["co-map-pin"]} />
        <div className={s["co-map-note"]}>
          Exact spot revealed morning of the supper
        </div>
        <div className={s["co-map-label"]}>
          <FiMapPin /> Mouraria · 5 min from Martim Moniz
        </div>
      </div>

      <div className={s["co-logi"]}>
        <div className={s["co-logi-card"]}>
          <div className={s["co-logi-ic"]}>
            <FiMapPin />
          </div>
          <div className={s["co-logi-h"]}>How you'll get the address</div>
          <div className={s["co-logi-p"]}>
            We keep supper spots private for safety. The exact door, buzzer code
            and directions land in your inbox at{" "}
            <strong>10 AM on the 28th</strong>.
          </div>
        </div>
        <div className={cx(s["co-logi-card"], s.jade)}>
          <div className={s["co-logi-ic"]}>
            <FiGift />
          </div>
          <div className={s["co-logi-h"]}>What to bring</div>
          <div className={s["co-logi-p"]}>
            Just yourself. If you'd like, a bottle to share is always welcome —
            the host cooks everything else.
          </div>
        </div>
      </div>

      <div className={s["co-sec"]}>Remind me</div>
      <div
        className={s["co-rem-chips"]}
        role="group"
        aria-label="Reminder preferences"
      >
        <button
          className={cx(s["co-rem-chip"], reminders.email && s.on)}
          type="button"
          onClick={() => toggleReminder("email")}
          aria-pressed={reminders.email}
        >
          Email
        </button>
        <button
          className={cx(s["co-rem-chip"], reminders.sms && s.on)}
          type="button"
          onClick={() => toggleReminder("sms")}
          aria-pressed={reminders.sms}
        >
          SMS
        </button>
        <button
          className={cx(s["co-rem-chip"], noReminders && s.on)}
          type="button"
          onClick={() => toggleReminder("none")}
          aria-pressed={noReminders}
        >
          No reminders
        </button>
      </div>

      <div className={s["co-sec"]}>Add to your calendar</div>
      <div className={s["co-cal-row"]}>
        <button
          className={s["co-cal-btn"]}
          type="button"
          onClick={() =>
            window.open(googleCalendarUrl(), "_blank", "noopener,noreferrer")
          }
        >
          <FiCalendar /> Google Calendar
        </button>
        <button
          className={s["co-cal-btn"]}
          type="button"
          onClick={() => {
            downloadIcs(ref);
            showToast("Calendar file downloaded.", "success");
          }}
        >
          <FiCalendar /> Apple / .ics
        </button>
        <button
          className={cx(s["co-cal-btn"], s.wallet)}
          type="button"
          onClick={() => showToast("Ticket added to your wallet.", "success")}
        >
          <FiCreditCard /> Add to Wallet
        </button>
      </div>

      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}
      >
        <Button
          variant="primary"
          to={routes.gathering}
          style={{ flex: 1, justifyContent: "center" }}
        >
          View gathering details
        </Button>
        <Button
          variant="ghost"
          onClick={copyShare}
          style={{ flex: 1, justifyContent: "center" }}
        >
          Tell a friend
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginTop: 10,
          justifyContent: "center",
        }}
      >
        <button
          className={s["co-back-btn"]}
          type="button"
          onClick={() => showToast("Transfer link sent to your email.", "info")}
          style={{ color: "var(--ink-60)" }}
        >
          Transfer my seat
        </button>
        <span style={{ color: "var(--ink-40)" }}>·</span>
        <button
          className={s["co-back-btn"]}
          type="button"
          onClick={() =>
            showToast("Add-a-guest link sent to your email.", "info")
          }
          style={{ color: "var(--ink-60)" }}
        >
          Add a guest
        </button>
      </div>
    </>
  );
}
