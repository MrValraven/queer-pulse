import { Badge, Button, type BadgeTone } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PaymentDto, PaymentStatus } from "../api/pieces.api";
import styles from "../PieceRecordPage.module.css";
import tabStyles from "./pieceTabs.module.css";

const PAYMENT_STATUS_TONE: Record<PaymentStatus, BadgeTone> = {
  agreed: "ghost",
  approved_unpaid: "amber",
  paid: "jade",
};

export interface MoneyMiniCardProps {
  payment: PaymentDto | null;
  onOpenMoney: () => void;
}

/** Small erail card: fee + payment status, with a shortcut into the Money tab. */
export function MoneyMiniCard({ payment, onOpenMoney }: MoneyMiniCardProps) {
  const { t } = useTranslation();
  const paymentStatusLabel: Record<PaymentStatus, string> = {
    agreed: t("magazine:piece.moneyMini.statusAgreed"),
    approved_unpaid: t("magazine:piece.moneyMini.statusApprovedUnpaid"),
    paid: t("magazine:piece.moneyMini.statusPaid"),
  };

  return (
    <div className={tabStyles.card}>
      <h3>{t("magazine:piece.moneyMini.heading")}</h3>
      <div className={styles.moneyRow}>
        <span>{payment?.fee ?? t("magazine:piece.moneyMini.noFeeYet")}</span>
        {payment && (
          <Badge tone={PAYMENT_STATUS_TONE[payment.status]}>
            {paymentStatusLabel[payment.status]}
          </Badge>
        )}
      </div>
      <Button size="sm" variant="ghost" onClick={onOpenMoney}>
        {t("magazine:piece.moneyMini.openMoney")}
      </Button>
    </div>
  );
}
