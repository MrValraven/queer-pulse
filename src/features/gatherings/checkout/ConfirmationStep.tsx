import { FiCalendar, FiCheck, FiCopy, FiMapPin, FiUser } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import { EVENT } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { ConfirmationNext } from "./ConfirmationNext";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function ConfirmationStep() {
  const { ref, qty, email, dietary, access } = useCheckout();
  const { showToast } = useToast();
  const seats = qty > 1 ? `${qty} seats` : "1 seat";
  const hasNotes = !!(dietary.trim() || access.trim());

  function copyRef() {
    if (ref) navigator.clipboard?.writeText(ref);
    showToast("Booking reference copied.", "success");
  }

  return (
    <>
      <div className={s["co-conf"]}>
        <div className={s["co-check-wrap"]}>
          <svg className={s["co-check-svg"]} viewBox="0 0 72 72" aria-hidden>
            <circle className={s["co-check-circle"]} cx="36" cy="36" r="32" />
            <polyline
              className={s["co-check-mark"]}
              points="20,36 30,47 52,24"
            />
          </svg>
        </div>
        <h1 className={s["co-conf-h"]}>
          You're <em>confirmed.</em>
        </h1>
        <p className={s["co-conf-sub"]}>
          A confirmation and {qty > 1 ? `${qty} tickets are` : "ticket is"} on
          the way to {email || "your inbox"}. See you on the 28th.
        </p>
        <div className={s["co-ref"]}>
          Booking ref <strong>{ref ?? "QP-000000"}</strong>
          <button
            className={s["co-ref-copy"]}
            type="button"
            onClick={copyRef}
            aria-label="Copy booking reference"
          >
            <FiCopy />
          </button>
        </div>
      </div>

      <div className={s["co-conf-detail"]}>
        <DetailRow
          icon={<FiCalendar />}
          bg="rgba(var(--accent-rgb),.1)"
          label="Date"
          value={EVENT.dateLong}
        />
        <DetailRow
          icon={<FiMapPin />}
          bg="rgba(var(--jade-rgb),.1)"
          label="Location"
          value="Mouraria — exact address shared on the day"
        />
        <DetailRow
          icon={<FiUser />}
          bg="rgba(45,27,61,.07)"
          label="Host · Guests"
          value={`${EVENT.hostName} · ${seats}`}
        />
      </div>

      <div className={cx(s["co-echo"], hasNotes && s.show)}>
        <div className={s["co-echo-h"]}>
          <FiCheck />
          The host has your notes
        </div>
        {dietary.trim() && (
          <div className={s["co-echo-row"]}>
            <b>Dietary:</b> {dietary.trim()}
          </div>
        )}
        {access.trim() && (
          <div className={s["co-echo-row"]}>
            <b>Access:</b> {access.trim()}
          </div>
        )}
      </div>

      <ConfirmationNext />
    </>
  );
}

function DetailRow({
  icon,
  bg,
  label,
  value,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string;
}) {
  return (
    <div className={s["co-cd-row"]}>
      <div className={s["co-cd-ic"]} style={{ background: bg }}>
        {icon}
      </div>
      <div>
        <div className={s["co-cd-lbl"]}>{label}</div>
        <div className={s["co-cd-val"]}>{value}</div>
      </div>
    </div>
  );
}
