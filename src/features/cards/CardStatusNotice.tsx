import type { JSX } from "react";
import { FiAlertCircle, FiCheckCircle, FiClock, FiSlash } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MyCardDTO } from "./api/cards.api";
import { cardExpiryState, daysUntilExpiry } from "./cardExpiry";
import styles from "./MyCardsPage.module.css";

const WITHDRAWN_ICONS: Record<"suspended" | "revoked", JSX.Element> = {
  suspended: <FiAlertCircle aria-hidden="true" />,
  revoked: <FiSlash aria-hidden="true" />,
};

/**
 * What this card's state means to the person holding it: whether it can prove
 * anything today, and when its term runs out.
 *
 * A revoked card never says WHY it was revoked: that reason belongs to the
 * issuer's log only (spec §K.6). What the holder gets is the fact plus a way
 * to talk to their community about it.
 *
 * Expiry is read from the dates rather than only from the effective status, so
 * a card that reads "active" still says when it stops working. That is the
 * whole point of SUS-07: the expiry clock used to be invisible until the day a
 * door turned someone away.
 *
 * Where the programme allows self renewal the copy points at the Renew control
 * beside it; where it does not, it points at the community. Neither wording
 * mentions any channel outside the app, because there is none.
 */
export function CardStatusNotice({ card }: { card: MyCardDTO }) {
  const { t } = useTranslation();
  const format = useFormat();

  // An issuer's decision outranks the clock, exactly as it does server-side:
  // a suspended or revoked card cannot prove anything today whatever its dates
  // say, and a countdown underneath it would be beside the point.
  if (card.status === "suspended" || card.status === "revoked") {
    return (
      <p className={styles.statusNotice} role="status">
        {WITHDRAWN_ICONS[card.status]} {t(`cards:status.${card.status}`)}
      </p>
    );
  }

  const state = cardExpiryState(card);
  const canRenew = card.program.allowsSelfRenew;

  if (state === "never") {
    return (
      <p className={styles.expiryNotice}>
        <FiCheckCircle aria-hidden="true" /> {t("cards:expiry.never")}
      </p>
    );
  }

  if (state === "expired") {
    return (
      <p className={styles.statusNotice} role="status">
        <FiClock aria-hidden="true" />{" "}
        {canRenew
          ? t("cards:status.expiredRenewable")
          : t("cards:status.expired")}
      </p>
    );
  }

  if (state === "expiringSoon") {
    const count = daysUntilExpiry(card);
    return (
      <p className={styles.statusNotice} role="status">
        <FiClock aria-hidden="true" />{" "}
        {canRenew
          ? t("cards:expiry.soonRenewable", { count })
          : t("cards:expiry.soon", { count })}
      </p>
    );
  }

  return (
    <p className={styles.expiryNotice}>
      <FiCheckCircle aria-hidden="true" />{" "}
      {t("cards:expiry.inDate", {
        date: format.date(new Date(card.expiresAt as string)),
      })}
    </p>
  );
}
