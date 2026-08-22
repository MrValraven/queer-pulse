import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { IssuerCardDTO } from "./api/cards.api";

export type NextCardStatus = "active" | "suspended" | "revoked";
export type PendingCardStatus = {
  card: IssuerCardDTO;
  nextStatus: NextCardStatus;
};

/**
 * The status controls an issuer has over one card: pause and revoke while it
 * works, reinstate once it does not.
 *
 * Its own file because both the roster row and the modal that shows the card
 * in full offer the same three actions, and a mod who opens a card should not
 * have to close it again to act on it. Neither surface owns the confirmation:
 * both hand a `PendingCardStatus` upward, so one `CardHolderStatusModal`
 * serves the whole panel.
 */
export function CardHolderActions({
  holder,
  onRequestStatus,
  className,
}: {
  holder: IssuerCardDTO;
  onRequestStatus: (pending: PendingCardStatus) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const isActive = holder.status === "active";
  // Expired cards get no status-change action here: reinstating one flips
  // `status` back to active but does not extend `expiresAt`, so the card
  // would keep reading as expired everywhere else. Rather than a
  // fake-success control, an expired card offers nothing to press until a
  // real renewal path exists (open question, out of Phase 1).
  if (holder.status === "expired") return null;

  return (
    <div className={className}>
      {isActive ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onRequestStatus({ card: holder, nextStatus: "suspended" })
            }
            aria-label={t("cards:holders.suspendAria", {
              name: holder.holderName,
            })}
          >
            {t("cards:holders.suspend")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onRequestStatus({ card: holder, nextStatus: "revoked" })
            }
            aria-label={t("cards:holders.revokeAria", {
              name: holder.holderName,
            })}
          >
            {t("cards:holders.revoke")}
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRequestStatus({ card: holder, nextStatus: "active" })}
          aria-label={t("cards:holders.reinstateAria", {
            name: holder.holderName,
          })}
        >
          {t("cards:holders.reinstate")}
        </Button>
      )}
    </div>
  );
}
