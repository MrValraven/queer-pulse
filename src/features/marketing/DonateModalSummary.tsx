import { FiCheck } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import modal from "../economy/ApplicationModals.module.css";

/** Charge breakdown panel + the "cover the fee" toggle. */
export function DonateModalSummary({
  amount,
  fee,
  total,
  monthly,
  coverFee,
  setCoverFee,
  feePct,
}: {
  amount: number;
  fee: number;
  total: number;
  monthly: boolean;
  coverFee: boolean;
  setCoverFee: React.Dispatch<React.SetStateAction<boolean>>;
  feePct: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <>
      <div className={modal.panel}>
        <div className={modal.rows}>
          <div className={modal.row}>
            <span className={modal.rowK}>
              {t(
                monthly
                  ? "marketing:donateModal.row.monthlyGift"
                  : "marketing:donateModal.row.oneOffGift",
              )}
            </span>
            <span className={modal.rowV}>
              {monthly
                ? t("marketing:donateModal.amount.monthly", {
                    amount: fmt.currency(amount),
                  })
                : fmt.currency(amount)}
            </span>
          </div>
          {coverFee && (
            <div className={modal.row}>
              <span className={modal.rowK}>
                {t("marketing:donateModal.row.feeCovered")}
              </span>
              <span className={modal.rowV}>{fmt.currency(fee)}</span>
            </div>
          )}
          <div className={modal.row}>
            <span className={modal.rowK}>
              {t("marketing:donateModal.row.chargedToday")}
            </span>
            <span className={modal.rowV}>
              {monthly
                ? t("marketing:donateModal.amount.monthly", {
                    amount: fmt.currency(total),
                  })
                : fmt.currency(total)}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`${modal.checkRow} ${coverFee ? modal.checkRowOn : ""}`}
        onClick={() => setCoverFee((v) => !v)}
        aria-pressed={coverFee}
      >
        <span className={modal.checkBox}>
          {coverFee && <FiCheck size={14} aria-hidden />}
        </span>
        <span className={modal.checkText}>
          <span className={modal.checkLabel}>
            {t("marketing:donateModal.checkLabel", { pct: feePct })}
          </span>
          <span className={modal.checkHint}>
            {t("marketing:donateModal.checkHint", {
              amount: fmt.currency(amount),
            })}
          </span>
        </span>
      </button>
    </>
  );
}
