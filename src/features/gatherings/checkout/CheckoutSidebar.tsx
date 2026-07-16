import { FiLock } from "react-icons/fi";
import { EVENT, type TierId } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { cx } from "./cx";
import s from "./checkout.module.css";

/** Mock: guests confirmed so far for this supper. Chrome phrase + count are
 * split so the number can carry a real plural in the catalog. */
const GUESTS_CONFIRMED_COUNT = 5;

const TIER_NAME_KEY: Record<TierId, string> = {
  solidarity: "gatherings:checkout.summary.tier.solidarity",
  standard: "gatherings:checkout.summary.tier.standard",
  supporter: "gatherings:checkout.summary.tier.supporter",
};

/** Mock avatar initials for the "who's coming" strip — fictional guests, so
 * these stay as data (expression-rendered) rather than authored prose. */
const HOST_INITIALS = "TB";
const GUEST_A_INITIALS = "MS";
const GUEST_B_INITIALS = "K";
const HOST_FIRST_NAME = "Tomás";

export function CheckoutSidebar() {
  const { step, tier, qty, promo, paid, pricing, goStep } = useCheckout();
  const { t } = useTranslation();
  const fmt = useFormat();
  const tierName = t(TIER_NAME_KEY[tier]);

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
              {t("gatherings:checkout.summary.editOrderCta")}
            </button>
          )}
        </div>
        <div className={s["cos-title"]}>{EVENT.title}</div>
        <div className={s["cos-meta"]}>{EVENT.dateShort}</div>
        <div className={s["cos-divider"]} />

        <div>
          <SLine
            label={t("gatherings:checkout.summary.lineItem", {
              count: qty,
              tier: tierName,
            })}
            value={fmt.currency(pricing.subtotal)}
          />
          {pricing.memberDisc > 0 && (
            <SLine
              label={t("gatherings:checkout.summary.memberDiscount")}
              value={"− " + fmt.currency(pricing.memberDisc)}
              disc
            />
          )}
          {pricing.promoDisc > 0 && (
            <SLine
              label={t("gatherings:checkout.summary.promoLabel", {
                code: promo ?? "",
              })}
              value={"− " + fmt.currency(pricing.promoDisc)}
              disc
            />
          )}
        </div>

        <div className={s["cos-divider"]} />
        <div className={s["cos-total"]}>
          <span>{t("gatherings:checkout.summary.total")}</span>
          <span>{fmt.currency(pricing.total)}</span>
        </div>
        <div className={s["cos-note"]}>
          {t("gatherings:checkout.summary.feesNote")}
        </div>

        {paid && (
          <div className={s["cos-paid"]}>
            <span className={s["cos-paid-dot"]} />
            <span>
              {t("gatherings:checkout.summary.paidLabel", {
                amount: fmt.currency(pricing.total),
              })}
            </span>
          </div>
        )}

        <div className={s["cos-who"]}>
          <div className={s["cos-who-avs"]}>
            <div
              className={s["cos-who-av"]}
              style={{ background: "var(--plum)", color: "var(--cream)" }}
            >
              {HOST_INITIALS}
            </div>
            <div
              className={s["cos-who-av"]}
              style={{
                background: "rgba(var(--jade-rgb),.16)",
                color: "var(--jade)",
              }}
            >
              {GUEST_A_INITIALS}
            </div>
            <div
              className={s["cos-who-av"]}
              style={{
                background: "rgba(var(--accent-rgb),.16)",
                color: "var(--accent-ink)",
              }}
            >
              {GUEST_B_INITIALS}
            </div>
            <div
              className={s["cos-who-av"]}
              style={{ background: "rgba(45,27,61,.1)", color: "var(--plum)" }}
            >
              +3
            </div>
          </div>
          <div className={s["cos-who-txt"]}>
            <Translation
              i18nKey="gatherings:checkout.summary.hostingLine"
              values={{ hostName: HOST_FIRST_NAME }}
              components={{ name: <b /> }}
            />
            <br />
            {t("gatherings:checkout.summary.guestsConfirmed", {
              count: GUESTS_CONFIRMED_COUNT,
            })}
          </div>
        </div>

        <div className={s["cos-safe"]}>
          <FiLock />
          {t("gatherings:checkout.summary.safetyNote")}
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
