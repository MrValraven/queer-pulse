import { Button } from "../../../shared/components/ui";
import { EVENT } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { FirstTimerCard } from "./FirstTimerCard";
import { SeatHold } from "./SeatHold";
import { WhoAmI } from "./WhoAmI";
import { HostCard } from "./HostCard";
import { MeetTheTable } from "./MeetTheTable";
import { TierSelect } from "./TierSelect";
import { SeatQuantity } from "./SeatQuantity";
import { PriceSummary } from "./PriceSummary";
import { PromoCode } from "./PromoCode";
import { AttendeeDetails } from "./AttendeeDetails";
import { GuestDetails } from "./GuestDetails";
import s from "./checkout.module.css";

interface Props {
  hold: { left: number; expired: boolean; reHold: () => void };
}

export function ReviewStep({ hold }: Props) {
  const { tryGoStep2 } = useCheckout();

  return (
    <>
      <h1 className={s["co-step-title"]}>
        Reserve your <em>seat</em>
      </h1>
      <p className={s["co-step-lede"]}>
        Pick what works for your budget — every seat at the table is the same
        welcome.
      </p>

      <FirstTimerCard />
      <SeatHold left={hold.left} expired={hold.expired} reHold={hold.reHold} />
      <WhoAmI />

      <div className={s["co-event-card"]}>
        <div className={s["co-ev-icon"]}>{EVENT.icon}</div>
        <div>
          <div className={s["co-ev-title"]}>{EVENT.title}</div>
          <div className={s["co-ev-meta"]}>
            {EVENT.dateLong}
            <br />
            {EVENT.neighbourhood}
          </div>
          <div className={s["co-ev-host"]}>
            Hosted by {EVENT.hostName} · {EVENT.seatsTotal} seats total
          </div>
        </div>
      </div>

      <HostCard />
      <MeetTheTable />

      <div className={s["co-sec"]}>Choose your ticket</div>
      <TierSelect />

      <div className={s["co-sec"]}>How many seats?</div>
      <SeatQuantity />

      <PriceSummary />

      <div className={s["co-sec"]}>
        Promo code <span className={s["co-sec-opt"]}>optional</span>
      </div>
      <PromoCode />

      <div className={s["co-sec"]}>Your details</div>
      <AttendeeDetails />
      <GuestDetails />

      <details className={s["co-policy"]}>
        <summary>Cancellation &amp; refund policy</summary>
        <div className={s["co-policy-body"]}>
          Full refund if you cancel up to <strong>48 hours</strong> before the
          gathering. Within 48 hours we can transfer your seat to a future
          supper, since ingredients are already bought. Life happens — if
          something urgent comes up, <strong>just message the host</strong> and
          we'll sort it out.
        </div>
      </details>

      <div className={s["co-step-nav"]}>
        <span />
        <Button
          variant="primary"
          onClick={() => tryGoStep2()}
          style={{ padding: "13px 28px", fontSize: 15 }}
        >
          Continue to payment →
        </Button>
      </div>
    </>
  );
}
