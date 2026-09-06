import { Badge, EmptyState } from "../../../../shared/components/ui";
import type { TFunction } from "../../../../shared/i18n/types";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatDate } from "../../../../shared/lib/date";
import type { WriterPaymentDto } from "../../api/writerWorkspace.api";
import { issueLabelText } from "../../magazineFormat";
import pieceStyles from "../pieceTabs.module.css";

/**
 * A payment date with its year. The rest of the writer workspace uses
 * `deskDateText` ("19 Aug"), which suits near-term deadlines; a payments list
 * runs back through old issues, so the year earns its place here.
 */
function paymentDateText(isoDate: string, language: string): string {
  return formatDate(isoDate, language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Where a fee stands, in the reader's language.
 *
 * The wire also carries `state`, the same fact as an English sentence the
 * server composed ("Paid 14 Jun 2026"), which is what this list used to print
 * at every reader whatever language they read in. `status`/`dueOn`/`paidOn`
 * carry it unformatted, so the sentence is composed here and the date is
 * formatted for the reader's locale. `state` stays as the fallback for a
 * status this build does not know.
 */
function paymentStateLabel(
  payment: WriterPaymentDto,
  t: TFunction,
  language: string,
): string {
  // `null` means no payment row has been agreed for the piece yet, which is
  // still shown rather than dropped: a writer should see that a fee is
  // outstanding rather than watch the row disappear.
  if (payment.status === null) {
    return t("magazine:writer.payments.state.notAgreed");
  }
  switch (payment.status) {
    case "paid":
      return payment.paidOn
        ? t("magazine:writer.payments.state.paidOn", {
            date: paymentDateText(payment.paidOn, language),
          })
        : t("magazine:writer.payments.state.paid");
    case "approved_unpaid":
      return payment.dueOn
        ? t("magazine:writer.payments.state.approvedUnpaidDue", {
            date: paymentDateText(payment.dueOn, language),
          })
        : t("magazine:writer.payments.state.approvedUnpaid");
    case "agreed":
      return payment.dueOn
        ? t("magazine:writer.payments.state.agreedDue", {
            date: paymentDateText(payment.dueOn, language),
          })
        : t("magazine:writer.payments.state.agreed");
    default:
      return payment.state;
  }
}

export interface WriterPaymentsTabProps {
  payments: WriterPaymentDto[];
}

/** Your payments: one row per piece that's carried a fee, paid or due.
 *  `WriterPaymentDto` has no id, so a payment is keyed by title+issue+index,
 *  which is stable enough for this read-only list.
 *
 *  `payment.issue` is the issue's DISPLAY number ("14"), which is what the
 *  rest of the magazine shows; the backend used to send `piece.issueId` here
 *  and a writer read a UUID off their own payments tab. */
export function WriterPaymentsTab({ payments }: WriterPaymentsTabProps) {
  const { t, language } = useTranslation();

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
                  ? issueLabelText(payment.issue, t)
                  : t("magazine:writer.payments.unscheduled")}
                {/* The issue's own title, which the wire has always carried
                    and this row never showed: "Issue 12" alone means little to
                    a writer scrolling back through a year of fees. */}
                {payment.issueTitle ? ` · ${payment.issueTitle}` : ""} ·{" "}
                {payment.fee}
              </div>
            </div>
            <span className={pieceStyles.spacer} />
            <Badge tone={payment.status === "paid" ? "jade" : "amber"}>
              {paymentStateLabel(payment, t, language)}
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
