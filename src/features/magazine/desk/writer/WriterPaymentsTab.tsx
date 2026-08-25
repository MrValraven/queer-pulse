import { Badge, EmptyState } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { WriterPaymentDto } from "../../api/writerWorkspace.api";
import pieceStyles from "../pieceTabs.module.css";

export interface WriterPaymentsTabProps {
  payments: WriterPaymentDto[];
}

/** Your payments: one row per piece that's carried a fee, paid or due.
 *  `WriterPaymentDto` has no id — a payment is keyed by title+issue+index,
 *  which is stable enough for this read-only list. */
export function WriterPaymentsTab({ payments }: WriterPaymentsTabProps) {
  const { t } = useTranslation();

  if (payments.length === 0) {
    return (
      <div className={pieceStyles.stack}>
        <EmptyState
          compact
          title={t("magazine:writer.payments.emptyTitle")}
          description={t("magazine:writer.payments.emptyDescription")}
        />
      </div>
    );
  }

  return (
    <div className={pieceStyles.stack}>
      <div className={pieceStyles.card}>
        {payments.map((payment, index) => (
          <div
            key={`${payment.title}-${payment.issue ?? index}`}
            className={pieceStyles.simrow}
          >
            <div>
              <b>{payment.title}</b>
              <div className={pieceStyles.tiny}>
                {payment.issue
                  ? t("magazine:writer.payments.issueLabel", {
                      issue: payment.issue,
                    })
                  : t("magazine:writer.payments.unscheduled")}{" "}
                · {payment.fee}
              </div>
            </div>
            <span className={pieceStyles.spacer} />
            <Badge
              tone={
                payment.state.toLowerCase().startsWith("paid")
                  ? "jade"
                  : "amber"
              }
            >
              {payment.state}
            </Badge>
          </div>
        ))}
        <p className={pieceStyles.tiny}>
          {t("magazine:writer.payments.terms")}
        </p>
      </div>
    </div>
  );
}
