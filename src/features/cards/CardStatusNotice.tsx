import type { JSX } from "react";
import { FiAlertCircle, FiClock, FiSlash } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EffectiveCardStatus } from "./api/cards.api";
import styles from "./MyCardsPage.module.css";

const ICONS: Record<Exclude<EffectiveCardStatus, "active">, JSX.Element | undefined> = {
  expired: <FiClock aria-hidden="true" />,
  suspended: <FiAlertCircle aria-hidden="true" />,
  revoked: <FiSlash aria-hidden="true" />,
};

/**
 * Explains why a card cannot currently prove anything.
 *
 * A revoked card never says WHY it was revoked: that reason belongs to the
 * issuer's log only (spec §K.6). What the holder gets is the fact plus a way
 * to talk to their community about it.
 */
export function CardStatusNotice({ status }: { status: EffectiveCardStatus }) {
  const { t } = useTranslation();
  if (status === "active") return null;

  return (
    <p className={styles.statusNotice} role="status">
      {ICONS[status]} {t(`cards:status.${status}`)}
    </p>
  );
}
