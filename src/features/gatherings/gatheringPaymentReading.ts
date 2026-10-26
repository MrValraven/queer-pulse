import { gatheringHasEnded, type GatheringDetail } from "./data";
import { isValidPaymentLink, paymentLinkHost } from "./paymentDetails";

/** What the detail page's "How to pay" block shows: the host's words and the
 *  link, either of which may be absent, and where that link goes. */
export interface PaymentDetailsView {
  instructions: string | null;
  url: string | null;
  /** The link's hostname without `www.`, set whenever `url` is. */
  host: string | null;
}

/** Whether the gathering is free: its cost kind says so, or it predates the
 *  field and the server reads its cost as free. */
export function isFreeGathering(gathering: GatheringDetail): boolean {
  if (gathering.costKind) return gathering.costKind === "free";
  return gathering.isFree !== false;
}

/**
 * The payment details a guest should see on the detail page, or `null` when
 * the block has nothing to say.
 *
 * Shown only while paying still means something: not for a free gathering,
 * not once it is cancelled, and not after it has ended. A link that is not a
 * full `https:` URL is dropped so it never renders as a broken button; the
 * server refuses one on the way in, so this only guards an older row.
 */
export function paymentDetailsToShow(
  gathering: GatheringDetail,
  now: Date = new Date(),
): PaymentDetailsView | null {
  if (isFreeGathering(gathering) || gathering.cancelled) return null;
  if (gatheringHasEnded(gathering, now)) return null;
  const instructions = gathering.paymentInstructions?.trim() || null;
  const url = gathering.paymentUrl?.trim() || null;
  const usableUrl = url && isValidPaymentLink(url) ? url : null;
  if (!instructions && !usableUrl) return null;
  return {
    instructions,
    url: usableUrl,
    host: usableUrl ? paymentLinkHost(usableUrl) : null,
  };
}
