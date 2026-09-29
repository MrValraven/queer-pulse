import type { TFunction } from "../../shared/i18n/types";

/**
 * The name a card surface prints for its holder.
 *
 * The backend sends `holderName: null` for a holder whose profile carries no
 * name (the row is gone, or both name fields are empty), so the fallback is
 * worded here in the reader's own language. Every card surface that names the
 * holder reads this: the card face, the public verify page, and the issuer's
 * roster, card modal and confirmations.
 */
export function cardHolderName(
  holderName: string | null | undefined,
  t: TFunction,
): string {
  return holderName?.trim() || t("cards:holder.fallbackName");
}
