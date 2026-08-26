import { FiRefreshCw } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ApiError } from "../../shared/api/client";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRenewMyCard } from "./api/useMyCards";
import type { MyCardDTO, RenewCardReasonCode } from "./api/cards.api";

/** The i18n leaf for each reason the server can refuse a renewal. Anything it
 *  does not name falls back to the generic line, so a reason added on the
 *  backend degrades to a readable sentence instead of an empty toast. */
const REASON_KEY: Record<RenewCardReasonCode, string> = {
  self_renew_not_allowed: "cards:renew.error.notAllowed",
  card_withdrawn: "cards:renew.error.withdrawn",
  not_a_member: "cards:renew.error.notAMember",
  programme_paused: "cards:renew.error.paused",
  no_expiry: "cards:renew.error.noExpiry",
  not_due: "cards:renew.error.notDue",
};

function reasonKeyFor(error: unknown): string {
  if (!(error instanceof ApiError)) return "cards:renew.error.generic";
  const reasonCode = (error.data as { reasonCode?: unknown } | null | undefined)
    ?.reasonCode;
  if (typeof reasonCode !== "string") return "cards:renew.error.generic";
  return (
    REASON_KEY[reasonCode as RenewCardReasonCode] ?? "cards:renew.error.generic"
  );
}

/**
 * Puts the member's own card back in date, in its last thirty days.
 *
 * The caller decides whether to render this at all (`isCardSelfRenewable`), so
 * this component owns only the write: a real pending state on the button, a
 * toast naming the new expiry on success, and the server's own reason on a
 * refusal. Nothing here reports success before the request has returned.
 *
 * Every refusal is a different sentence. "Your community renews these cards"
 * and "you are no longer a member of this community" are answers a person can
 * act on; one generic failure toast for both is the thing this avoids.
 */
export function CardRenewAction({
  card,
  onRenewed,
}: {
  card: MyCardDTO;
  /**
   * The card's new expiry, once the renewal has actually returned one.
   *
   * Only demo mode passes a handler. In live mode the wallet refetches and the
   * server is the single source of truth for the card's next state; in demo
   * nothing is written anywhere, so the page holds the new date itself rather
   * than showing a success toast over a card that visibly did not move.
   */
  onRenewed?: (expiresAt: string) => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const renewCard = useRenewMyCard();

  const renew = () => {
    if (renewCard.isPending) return;
    renewCard.mutate(card.id, {
      onSuccess: (renewed) => {
        if (renewed.expiresAt) onRenewed?.(renewed.expiresAt);
        showToast(
          t("cards:renew.toast", {
            date: format.date(
              new Date(renewed.expiresAt ?? card.expiresAt ?? Date.now()),
            ),
          }),
          "success",
        );
      },
      onError: (error) => showToast(t(reasonKeyFor(error)), "error"),
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={renew}
      disabled={renewCard.isPending}
      aria-label={t("cards:renew.ctaAria", { community: card.communityName })}
    >
      <FiRefreshCw aria-hidden="true" />{" "}
      {renewCard.isPending ? t("cards:renew.pending") : t("cards:renew.cta")}
    </Button>
  );
}
