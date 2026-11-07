import { FiRefreshCw } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRenewMyCard } from "./api/useMyCards";
import type { MyCardDTO } from "./api/cards.api";
import { cardRenewErrorCopy } from "./cardActionErrors";

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
      onError: (error) => {
        const cause = cardRenewErrorCopy(error);
        showToast(t(cause.key, cause.values), "error");
      },
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
