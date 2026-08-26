import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { UpdatePaymentDto } from "../api/pieces.api";
import type { PieceRecordView } from "../data/pieceRecord.data";
import { KV } from "./KV";
import { formatMoney, moneyNote } from "./money";
import styles from "./pieceTabs.module.css";

export interface MoneyTabProps {
  record: PieceRecordView;
  // Reserved for a future edit-fee affordance on this tab; not wired to any
  // control yet (only "Mark for payment" and "Tell the writer" exist today).
  onSavePayment: (payload: UpdatePaymentDto) => void;
  onMarkPaid: () => void;
}

export function MoneyTab({
  record,
  onMarkPaid,
  onSavePayment: _onSavePayment,
}: MoneyTabProps) {
  const { t } = useTranslation();
  const payment = record.payment;
  const feeNote = moneyNote(payment?.fee ?? null, payment?.feeText ?? null);
  const expensesNote = moneyNote(
    payment?.expenses ?? null,
    payment?.expensesText ?? null,
  );

  if (!payment) {
    return (
      <div className={styles.stack}>
        <div className={styles.card}>
          <p className={styles.tiny}>
            {t("magazine:piece.money.noPaymentYet")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <div className={styles.card}>
        <h3>{t("magazine:piece.money.feeHeading")}</h3>
        <div className={styles.kvs}>
          <KV
            label={t("magazine:piece.money.agreedFee")}
            value={
              formatMoney(payment.currency, payment.fee) ??
              payment.feeText ??
              t("magazine:piece.money.noFeeAgreed")
            }
          />
          <KV
            label={t("magazine:piece.money.expenses")}
            value={
              formatMoney(payment.currency, payment.expenses) ??
              payment.expensesText ??
              t("magazine:piece.money.noneFiled")
            }
          />
          <KV
            label={t("magazine:piece.money.invoice")}
            value={payment.invoice ?? t("magazine:piece.money.notReceived")}
          />
          <KV
            label={t("magazine:piece.money.filed")}
            value={payment.filedOn ?? t("magazine:piece.money.notFiled")}
          />
          <KV label={t("magazine:piece.money.terms")} value={payment.terms} />
          <KV
            label={t("magazine:piece.money.payBy")}
            value={payment.dueOn ?? t("magazine:piece.money.noDateSet")}
            warn
          />
        </div>
        {/* CON-18 — the desk's own wording, shown only when it says something
            the amount cannot ("18 travel, receipts with Marta"). */}
        {feeNote || expensesNote ? (
          <div className={styles.note}>
            {feeNote
              ? t("magazine:piece.money.feeAsFiled", { text: feeNote })
              : null}
            {feeNote && expensesNote ? " · " : null}
            {expensesNote
              ? t("magazine:piece.money.expensesAsFiled", {
                  text: expensesNote,
                })
              : null}
          </div>
        ) : null}
        {payment.status === "approved_unpaid" ? (
          <div className={`${styles.note} ${styles.warn}`}>
            {t("magazine:piece.money.unpaidWarning")}
          </div>
        ) : null}
        <div className={styles.row}>
          <Button size="sm" variant="primary" onClick={onMarkPaid}>
            {t("magazine:piece.money.markForPayment")}
          </Button>
          <Button size="sm" variant="ghost">
            {t("magazine:piece.money.tellTheWriter")}
          </Button>
        </div>
      </div>
    </div>
  );
}
