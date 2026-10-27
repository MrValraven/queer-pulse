import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { FinanceSourceBadge } from "./FinanceSourceBadge";
import type { LedgerComposition, LedgerShare } from "./adminGovernanceLedger";
import styles from "./AdminGovernancePage.module.css";

/** In live mode, a still-seeded figure never renders as if it were real data.
 *  It shows this empty state with a direct path to correct it instead. Demo
 *  mode is exempt: every demo figure starts `seeded` on purpose, to
 *  demonstrate the provenance badge, so it keeps showing its number. */
export function NotVerifiedPlaceholder({ onEdit }: { onEdit: () => void }) {
  const { t } = useTranslation();
  return (
    <span className={styles.notVerified}>
      <span className={styles.notVerifiedDash} aria-hidden>
        –
      </span>
      <button type="button" className={styles.notVerifiedCta} onClick={onEdit}>
        {t("admin:governance.finances.provenance.notVerifiedCta")}
      </button>
    </span>
  );
}

/** The rows below carry every figure, so the bar itself is decorative. */
export function CompositionBar({
  composition,
}: {
  composition: LedgerComposition;
}) {
  return (
    <div className={styles.ledgerBar} aria-hidden>
      <div className={styles.ledgerBarFill}>
        {composition.shares
          .filter((share) => share.amount > 0)
          .map((share, index) => (
            <span
              key={`${index}-${share.line.label}`}
              className={[
                styles.ledgerSegment,
                styles[`meter_${share.colorName}`],
              ].join(" ")}
              style={{ flexGrow: share.amount }}
            />
          ))}
        {composition.hasRemainder && (
          <span
            className={[styles.ledgerSegment, styles.ledgerHatch].join(" ")}
            style={{ flexGrow: composition.remainder }}
          />
        )}
      </div>
    </div>
  );
}

export function LedgerRow({
  share,
  onEdit,
}: {
  share: LedgerShare;
  onEdit: () => void;
}) {
  const fmt = useFormat();
  const { line, colorName, amount, isShown, percent } = share;
  return (
    <li className={styles.ledgerRow}>
      <span
        className={[styles.ledgerDot, styles[`meter_${colorName}`]].join(" ")}
        aria-hidden
      />
      <span className={styles.ledgerRowLabel}>
        {line.label}
        {line.source === "manual" && <FinanceSourceBadge source="manual" />}
      </span>
      {isShown ? (
        <>
          <span className={styles.ledgerPercent}>
            {fmt.number(Math.round(percent))}%
          </span>
          <span className={styles.ledgerAmount}>
            {fmt.currency(amount, "EUR")}
          </span>
        </>
      ) : (
        <span className={styles.ledgerPlaceholder}>
          <NotVerifiedPlaceholder onEdit={onEdit} />
        </span>
      )}
    </li>
  );
}

export function RemainderRow({
  composition,
  onEdit,
}: {
  composition: LedgerComposition;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <li className={styles.ledgerRow}>
      <span
        className={[styles.ledgerDot, styles.ledgerHatch].join(" ")}
        aria-hidden
      />
      <span className={styles.ledgerRowLabel}>
        <span className={styles.ledgerRemainderLabel}>
          {t("admin:governance.ledgerCard.remainder.label")}
        </span>
        <button type="button" className={styles.ledgerTextCta} onClick={onEdit}>
          {t("admin:governance.ledgerCard.remainder.cta")}
        </button>
      </span>
      <span className={styles.ledgerPercent}>
        {fmt.number(Math.round(composition.remainderPercent))}%
      </span>
      <span
        className={[styles.ledgerAmount, styles.ledgerAmountMuted].join(" ")}
      >
        {fmt.currency(composition.remainder, "EUR")}
      </span>
    </li>
  );
}
