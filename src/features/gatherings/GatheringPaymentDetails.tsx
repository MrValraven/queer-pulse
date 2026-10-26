import { useId } from "react";
import { FiCreditCard, FiExternalLink } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import type { GatheringDetail } from "./data";
import {
  isFreeGathering,
  paymentDetailsToShow,
} from "./gatheringPaymentReading";
import { GatheringCostRow } from "./GatheringWhereRow";
import panelStyles from "./GatheringDetailPanels.module.css";
import styles from "./GatheringPaymentDetails.module.css";

/** The host's instructions as the lines they typed, blank ones dropped. */
function instructionLines(instructions: string | null): string[] {
  if (!instructions) return [];
  return instructions
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * "How to pay" on the event page, right under what it costs: the host's own
 * instructions as plain text, one block per line they typed, a button out to
 * the host's payment page with the site it goes to beneath it, and a quiet
 * line saying where the money goes.
 *
 * DISPLAY ONLY. QueerPulse takes no money, so nothing here promises a
 * charge, a refund or a ticket. The link leaves the platform in a new tab
 * with `noreferrer` (the host's payment page should not learn which page a
 * guest came from) and `nofollow` (a host's link earns no ranking from us).
 *
 * Renders nothing for a free, cancelled or ended event, or when the host
 * added neither field (`paymentDetailsToShow`).
 */
function GatheringPaymentRow({ gathering }: { gathering: GatheringDetail }) {
  const { t } = useTranslation();
  const labelId = useId();
  const payment = paymentDetailsToShow(gathering);
  if (!payment) return null;
  const lines = instructionLines(payment.instructions);

  return (
    <div role="group" aria-labelledby={labelId} className={panelStyles.row}>
      <span className={panelStyles.rowIcon} aria-hidden>
        <FiCreditCard />
      </span>
      <span className={panelStyles.rowText}>
        <span id={labelId} className={panelStyles.rowLabel}>
          {t("gatherings:gathering.where.paymentHeading")}
        </span>
        {lines.length > 0 && (
          <span className={styles.instructions}>
            {lines.map((line, lineIndex) => (
              <span key={`${lineIndex}-${line}`} className={styles.line}>
                {line}
              </span>
            ))}
          </span>
        )}
        {payment.url && (
          <Button
            className={styles.linkButton}
            variant="soft"
            size="sm"
            href={payment.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {t("gatherings:gathering.where.paymentLinkCta")}
            <FiExternalLink aria-hidden className={styles.linkIcon} />
            <span className="visuallyHidden">
              {t("gatherings:gathering.where.opensInNewTab")}
            </span>
          </Button>
        )}
        {payment.url && payment.host && (
          <span className={styles.linkHost}>
            {t("gatherings:gathering.where.paymentLinkHost", {
              host: payment.host,
            })}
          </span>
        )}
        <span className={cx(panelStyles.costNote, styles.note)}>
          {t("gatherings:gathering.where.paymentNote")}
        </span>
      </span>
    </div>
  );
}

/**
 * How to pay, as a row inside the live Where panel, or with `isStandalone`
 * as a "Cost" panel of its own for the demo page, which has no Where panel
 * to sit in. That panel leads with the same cost row the Where panel shows
 * (`GatheringCostRow`), so the price is on the demo page even when the host
 * added no payment details, and renders nothing for a free event.
 */
export function GatheringPaymentDetails({
  gathering,
  isStandalone = false,
}: {
  gathering: GatheringDetail;
  isStandalone?: boolean;
}) {
  const { t } = useTranslation();
  if (!isStandalone) return <GatheringPaymentRow gathering={gathering} />;
  if (isFreeGathering(gathering)) return null;
  return (
    <section className={panelStyles.panel}>
      <h2 className={panelStyles.heading}>
        {t("gatherings:gathering.where.costLabel")}
      </h2>
      <div className={panelStyles.rows}>
        <GatheringCostRow gathering={gathering} />
        <GatheringPaymentRow gathering={gathering} />
      </div>
    </section>
  );
}
