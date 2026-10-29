// Studio purchases: the frontend mirror of contract 1.6 (the constants and
// the pure price checks). The server checks every value again; these only
// let the price field and the buy sheet name the reason before a request.
import type { StudioPriceMode } from "./api/studio.types";
import type {
  StudioOfferView,
  StudioOfferViewerView,
  StudioPriceView,
  StudioPurchaseItemView,
} from "./api/studioPurchases.adapters";
import type { StudioOfferState } from "./api/studioPurchases.types";

export const STUDIO_SELLABLE_RELEASE_TYPES = ["album", "ep", "single"] as const;

export const STUDIO_PURCHASE_LIMITS = {
  fixedPriceMinCents: 100,
  priceMaxCents: 50000,
  minimumPriceMinCents: 0,
  amountMaxCents: 50000,
  payerNameMaxLength: 60,
  declineNoteMaxLength: 200,
  paymentMethodsMax: 8,
} as const;

/** Euro steps the quick picks climb, in cents. */
export const STUDIO_QUICK_PICK_STEPS_CENTS: readonly number[] = [
  100, 200, 300, 500, 800, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500,
  10000, 15000, 20000, 25000, 30000, 40000, 50000,
];

const QUICK_PICKS_ABOVE_MINIMUM = 2;
const EURO_TEXT_PATTERN = /^(\d{1,6})(?:[.,](\d{1,2}))?$/;

export function isSellableReleaseType(type: string): boolean {
  return (STUDIO_SELLABLE_RELEASE_TYPES as readonly string[]).includes(type);
}

/** "3", "3.5", "3,50", " 3 € " read 300, 350, 350, 300; more than two
 *  decimals, a sign, letters, empty or a space between digit groups
 *  (" 3 € 5") read null. Cents come from splitting the text with
 *  whole-number maths only. */
export function centsFromEuroText(text: string): number | null {
  const withoutMark = text.trim().replace("€", "").trim();
  const match = EURO_TEXT_PATTERN.exec(withoutMark);
  if (!match) return null;
  const wholeEuros = Number(match[1]);
  const fractionCents = Number((match[2] ?? "").padEnd(2, "0"));
  return wholeEuros * 100 + fractionCents;
}

/** 300 reads "3", 350 reads "3.50" or "3,50" by the separator asked for. */
export function euroTextFromCents(
  cents: number,
  decimalSeparator: "." | ",",
): string {
  const wholeCents = Math.max(0, Math.round(cents));
  const wholeEuros = Math.floor(wholeCents / 100);
  const remainderCents = wholeCents % 100;
  if (remainderCents === 0) return String(wholeEuros);
  return `${wholeEuros}${decimalSeparator}${String(remainderCents).padStart(2, "0")}`;
}

/** The minimum, then the first two steps above it, capped at the amount cap. */
export function quickPickAmountsCents(minimumCents: number): number[] {
  const cap = STUDIO_PURCHASE_LIMITS.amountMaxCents;
  const floorCents = Math.min(minimumCents, cap);
  const stepsAbove = STUDIO_QUICK_PICK_STEPS_CENTS.filter(
    (stepCents) => stepCents > floorCents && stepCents <= cap,
  ).slice(0, QUICK_PICKS_ABOVE_MINIMUM);
  return [floorCents, ...stepsAbove];
}

/** The artist's price field: null when valid, else a catalog key. */
export function priceErrorKeyOf(
  mode: StudioPriceMode,
  amountCents: number | null,
): string | null {
  if (amountCents === null) return "studio:purchase.price.amountRequired";
  const lowestCents =
    mode === "fixed"
      ? STUDIO_PURCHASE_LIMITS.fixedPriceMinCents
      : STUDIO_PURCHASE_LIMITS.minimumPriceMinCents;
  const isInRange =
    Number.isInteger(amountCents) &&
    amountCents >= lowestCents &&
    amountCents <= STUDIO_PURCHASE_LIMITS.priceMaxCents;
  return isInRange ? null : "studio:errors.reason.studio_price_out_of_range";
}

/** The buyer's amount: null when valid, else a catalog key naming the
 *  reason. A fixed price accepts exactly that price. */
export function amountErrorKeyOf(
  price: StudioPriceView,
  amountCents: number | null,
): string | null {
  if (amountCents === null) return "studio:purchase.sheet.amountRequired";
  if (amountCents > STUDIO_PURCHASE_LIMITS.amountMaxCents) {
    return "studio:errors.reason.studio_purchase_amount_above_cap";
  }
  if (price.mode === "fixed" && amountCents !== price.amountCents) {
    return "studio:errors.reason.studio_purchase_price_changed";
  }
  if (amountCents < price.amountCents) {
    return "studio:errors.reason.studio_purchase_amount_below_minimum";
  }
  return null;
}

/** The state a buy panel renders, in contract 3.1 order: the viewer's own
 *  persona wins first (an owned or pending claim stays out of sight), then
 *  an owned purchase (so an item taken off sale still shows its download),
 *  then the state the server sent. */
export function offerPanelStateOf(
  viewer: Pick<
    StudioOfferViewerView,
    "state" | "refusalCode" | "ownedPurchase"
  >,
): StudioOfferState {
  if (
    viewer.state === "refused" &&
    viewer.refusalCode === "studio_purchase_own_persona"
  ) {
    return "refused";
  }
  return viewer.ownedPurchase !== null ? "owned" : viewer.state;
}

/** The release formats a Buy button names; anything else reads "Buy release". */
const RELEASE_BUY_KINDS: readonly string[] = ["album", "ep", "single"];

/** "Buy album", "Buy EP", "Buy single", "Buy track" or "Buy release", read
 *  from the item's kind and the format its label key names. */
export function buyLabelKeyOf(
  item: Pick<StudioPurchaseItemView, "kind" | "formatLabelKey">,
): string {
  if (item.kind === "track") return "studio:purchase.panel.buy.track";
  const format = item.formatLabelKey.split(".").pop() ?? "";
  const kind = RELEASE_BUY_KINDS.includes(format) ? format : "release";
  return `studio:purchase.panel.buy.${kind}`;
}

/** A release with no price of its own whose tracks the viewer can buy, is
 *  waiting on or owns: it sells track by track. */
export function isSoldTrackByTrack(
  offer: Pick<StudioOfferView, "item" | "price" | "trackOffers">,
): boolean {
  return (
    offer.item.kind === "release" &&
    offer.price === null &&
    offer.trackOffers.some((trackOffer) => trackOffer.state !== "refused")
  );
}
