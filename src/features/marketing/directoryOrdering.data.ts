import {
  FULFILMENT_LABEL_KEYS,
  PAYMENT_LABEL_KEYS,
  REGISTRATION_DETAIL_KEYS,
  SESSION_FORMAT_LABEL_KEYS,
  SHIPS_FROM_DETAIL_KEYS,
  type ListingPublicOnlineDetails,
} from "./listBusiness/listingOnline.data";

const KEY = "marketing:directory.detail.ordering";

/** One line of a fact: a catalog sentence, the business's own words, or a
 *  catalog note that qualifies the line above it (the VAT sentence), which
 *  reads quieter and smaller with an info icon. */
export type OrderingLine =
  | { kind: "key"; key: string; values?: Record<string, string> }
  | { kind: "note"; key: string }
  | { kind: "text"; text: string };

export interface OrderingFact {
  id:
    | "howGet"
    | "shipping"
    | "pickup"
    | "payments"
    | "sessions"
    | "replyNote"
    | "registration";
  labelKey: string;
  lines: OrderingLine[];
}

const keyLine = (key: string, values?: Record<string, string>): OrderingLine =>
  values ? { kind: "key", key, values } : { kind: "key", key };

/** Facts whose lines read as one inline list ("Card · PayPal"): short labels
 *  that stack into a tall column of single words otherwise. */
export const INLINE_ORDERING_FACT_IDS: ReadonlySet<OrderingFact["id"]> =
  new Set(["payments"]);

/**
 * A business that books sessions and posts nothing: it names session formats
 * and no way of getting a product. Its block reads as "Booking & sessions"
 * and its reply note drops the dispatch half of the label.
 */
export function isSessionsOnly(details: ListingPublicOnlineDetails): boolean {
  return details.sessionFormats.length > 0 && details.fulfilment.length === 0;
}

/**
 * The "Ordering & delivery" facts, in page order, leaving out every one the
 * business left empty. Pure, so the page and the editor's full preview read
 * the same list. The VAT note explains what an unticked IOSS box means for a
 * buyer in Portugal (23% VAT, a carrier fee, the 3 euro customs fee per item).
 */
export function orderingFacts(
  details: ListingPublicOnlineDetails,
): OrderingFact[] {
  const facts: OrderingFact[] = [];
  if (details.fulfilment.length > 0) {
    facts.push({
      id: "howGet",
      labelKey: `${KEY}.howGet`,
      lines: details.fulfilment.map((option) =>
        keyLine(FULFILMENT_LABEL_KEYS[option]),
      ),
    });
  }
  if (details.shipsFrom !== "") {
    const vatLines =
      details.shipsFrom === "outsideEu"
        ? [
            {
              kind: "note" as const,
              key: details.isVatIncluded
                ? `${KEY}.vatIncluded`
                : `${KEY}.vatExtra`,
            },
          ]
        : [];
    facts.push({
      id: "shipping",
      labelKey: `${KEY}.shipping`,
      lines: [keyLine(SHIPS_FROM_DETAIL_KEYS[details.shipsFrom]), ...vatLines],
    });
  }
  if (details.pickupNote.trim() !== "") {
    facts.push({
      id: "pickup",
      labelKey: `${KEY}.pickup`,
      lines: [{ kind: "text", text: details.pickupNote.trim() }],
    });
  }
  if (details.payments.length > 0) {
    facts.push({
      id: "payments",
      labelKey: `${KEY}.payments`,
      lines: details.payments.map((method) =>
        keyLine(PAYMENT_LABEL_KEYS[method]),
      ),
    });
  }
  if (details.sessionFormats.length > 0) {
    facts.push({
      id: "sessions",
      labelKey: `${KEY}.sessions`,
      lines: details.sessionFormats.map((format) =>
        keyLine(SESSION_FORMAT_LABEL_KEYS[format]),
      ),
    });
  }
  if (details.replyNote.trim() !== "") {
    facts.push({
      id: "replyNote",
      labelKey: isSessionsOnly(details)
        ? `${KEY}.replyNoteSessions`
        : `${KEY}.replyNote`,
      lines: [{ kind: "text", text: details.replyNote.trim() }],
    });
  }
  const { body, number } = details.registration;
  if (body !== "" && number.trim() !== "") {
    facts.push({
      id: "registration",
      labelKey: `${KEY}.registrationLabel`,
      lines: [
        keyLine(REGISTRATION_DETAIL_KEYS[body], { number: number.trim() }),
        keyLine(`${KEY}.registrationNote`),
      ],
    });
  }
  return facts;
}

/** Whether the block says anything at all: a main link, another link or a
 *  fact. An empty block keeps its heading off the page. */
export function hasOrderingContent(
  details: ListingPublicOnlineDetails,
): boolean {
  return (
    details.mainLink !== null ||
    details.moreLinks.length > 0 ||
    orderingFacts(details).length > 0
  );
}
