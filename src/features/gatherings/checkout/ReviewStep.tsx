import { Button } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();

  return (
    <>
      <h1 className={s["co-step-title"]}>
        <Translation
          i18nKey="gatherings:checkout.review.title"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={s["co-step-lede"]}>
        {t("gatherings:checkout.review.lede")}
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
            {t("gatherings:checkout.review.hostedBy", {
              host: EVENT.hostName,
              count: EVENT.seatsTotal,
            })}
          </div>
        </div>
      </div>

      <HostCard />
      <MeetTheTable />

      <div className={s["co-sec"]}>
        {t("gatherings:checkout.tiers.sectionTitle")}
      </div>
      <TierSelect />

      <div className={s["co-sec"]}>
        {t("gatherings:checkout.seats.sectionTitle")}
      </div>
      <SeatQuantity />

      <PriceSummary />

      <div className={s["co-sec"]}>
        {t("gatherings:checkout.review.promoLabel")}{" "}
        <span className={s["co-sec-opt"]}>
          {t("gatherings:checkout.review.promoOptional")}
        </span>
      </div>
      <PromoCode />

      <div className={s["co-sec"]}>
        {t("gatherings:checkout.attendee.sectionTitle")}
      </div>
      <AttendeeDetails />
      <GuestDetails />

      <details className={s["co-policy"]}>
        <summary>{t("gatherings:checkout.review.policySummary")}</summary>
        <div className={s["co-policy-body"]}>
          <Translation
            i18nKey="gatherings:checkout.review.policyBody"
            components={{ strong: <strong /> }}
          />
        </div>
      </details>

      <div className={s["co-step-nav"]}>
        <span />
        <Button
          variant="primary"
          onClick={() => tryGoStep2()}
          style={{ padding: "13px 28px", fontSize: 15 }}
        >
          {t("gatherings:checkout.review.continueCta")} →
        </Button>
      </div>
    </>
  );
}
