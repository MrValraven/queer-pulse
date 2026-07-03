import { FiLock } from "react-icons/fi";
import { EVENT, TIER_MAP } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { eur } from "./checkout.validation";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function CheckoutSidebar() {
  const { step, tier, qty, promo, paid, pricing, goStep } = useCheckout();
  const tierName = TIER_MAP[tier].name + " seat";

  return (
    <aside className={s["co-sidebar"]}>
      <div className={s["cos-card"]}>
        <div className={s["cos-top"]}>
          <div className={s["cos-ev-icon"]}>{EVENT.icon}</div>
          {step === 2 && (
            <button
              className={cx(s["cos-edit"], s.show)}
              type="button"
              onClick={() => goStep(1, "back")}
            >
              Edit order
            </button>
          )}
        </div>
        <div className={s["cos-title"]}>{EVENT.title}</div>
        <div className={s["cos-meta"]}>{EVENT.dateShort}</div>
        <div className={s["cos-divider"]} />

        <div>
          <SLine label={`${qty} × ${tierName}`} value={eur(pricing.subtotal)} />
          {pricing.memberDisc > 0 && (
            <SLine
              label="Member discount"
              value={"− " + eur(pricing.memberDisc)}
              disc
            />
          )}
          {pricing.promoDisc > 0 && (
            <SLine
              label={"Promo · " + promo}
              value={"− " + eur(pricing.promoDisc)}
              disc
            />
          )}
        </div>

        <div className={s["cos-divider"]} />
        <div className={s["cos-total"]}>
          <span>Total</span>
          <span>{eur(pricing.total)}</span>
        </div>
        <div className={s["cos-note"]}>
          Includes all fees. Processed securely by Stripe.
        </div>

        {paid && (
          <div className={s["cos-paid"]}>
            <span className={s["cos-paid-dot"]} />
            <span>Paid · {eur(pricing.total)}</span>
          </div>
        )}

        <div className={s["cos-who"]}>
          <div className={s["cos-who-avs"]}>
            <div
              className={s["cos-who-av"]}
              style={{ background: "var(--plum)", color: "var(--cream)" }}
            >
              TB
            </div>
            <div
              className={s["cos-who-av"]}
              style={{
                background: "rgba(var(--jade-rgb),.16)",
                color: "var(--jade)",
              }}
            >
              MS
            </div>
            <div
              className={s["cos-who-av"]}
              style={{
                background: "rgba(var(--accent-rgb),.16)",
                color: "var(--accent-ink)",
              }}
            >
              K
            </div>
            <div
              className={s["cos-who-av"]}
              style={{ background: "rgba(45,27,61,.1)", color: "var(--plum)" }}
            >
              +3
            </div>
          </div>
          <div className={s["cos-who-txt"]}>
            <b>Tomás</b> is hosting
            <br />5 guests confirmed so far
          </div>
        </div>

        <div className={s["cos-safe"]}>
          <FiLock />
          Invite-only · every member is verified before they can book.
        </div>
      </div>
    </aside>
  );
}

function SLine({
  label,
  value,
  disc,
}: {
  label: string;
  value: string;
  disc?: boolean;
}) {
  return (
    <div className={s["cos-line"]}>
      <span className={s["cos-line-lbl"]}>{label}</span>
      <span className={cx(s["cos-line-val"], disc && s.disc)}>{value}</span>
    </div>
  );
}
