import { Badge, type BadgeTone } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioBuyerPurchaseView } from "./api/studioPurchases.adapters";
import type { StudioPurchaseStatusValue } from "./api/studioPurchases.types";
import styles from "./StudioPurchasePieces.module.css";

const STATUS_TONE: Record<StudioPurchaseStatusValue, BadgeTone> = {
  pending: "amber",
  confirmed: "jade",
  declined: "danger",
  cancelled: "plum",
  expired: "plum",
};

/** The status chip and the lines the status carries: who the buyer waits
 *  for, why a payment was declined (with the artist's note), or that the
 *  claim lapsed or was cancelled. A confirmed purchase shows the chip only. */
export function StudioPurchaseStatus({
  purchase,
}: {
  purchase: StudioBuyerPurchaseView;
}) {
  const { t } = useTranslation();
  const artist = purchase.artist.name;
  const lines: string[] = [];
  if (purchase.status === "pending")
    lines.push(t("studio:purchase.statusLine.pending", { artist }));
  if (purchase.status === "expired")
    lines.push(t("studio:purchase.statusLine.expired", { artist }));
  if (purchase.status === "cancelled")
    lines.push(t("studio:purchase.statusLine.cancelled"));
  if (purchase.status === "declined") {
    lines.push(
      t(`studio:purchase.declineReason.${purchase.declineReason ?? "other"}`, {
        artist,
      }),
    );
    if (purchase.declineNote)
      lines.push(
        t("studio:purchase.declineNoteLine", {
          artist,
          note: purchase.declineNote,
        }),
      );
    lines.push(t("studio:purchase.statusLine.declinedAgain"));
  }
  return (
    <div className={styles.status}>
      <Badge tone={STATUS_TONE[purchase.status]}>
        {t(`studio:purchase.status.${purchase.status}`)}
      </Badge>
      {lines.map((line) => (
        <p key={line} className={styles.statusLine}>
          {line}
        </p>
      ))}
    </div>
  );
}
