import { ANCHOR, type MissingField } from "../listBusiness.data";

type AnchorKey = keyof typeof ANCHOR;

/** ANCHOR keys staff may see as "still missing": public listing fields only. */
export const LISTING_EDIT_PUBLIC_MISSING_CODES: readonly AnchorKey[] = [
  "name",
  "cats",
  "hood",
  "price",
  "blurb",
  "tagline",
  "whatItIs",
  "langs",
  "attributes",
  "highlights",
  "inclusionPractices",
  "saferSpacePolicyUrl",
  "langsOther",
  "entryMode",
  "coverPolicy",
  "coverFreeBefore",
  "waysToPay",
  "nifInvoices",
  "address",
  "online",
  "city",
  "hasOnlineShop",
  "mainLink",
  "moreLinks",
  "fulfilment",
  "pickupNote",
  "shipsFrom",
  "payments",
  "sessionFormats",
  "registration",
  "replyNote",
  "whereYouWork",
  "meetingPoint",
  "byAppointment",
  "hours",
  "hoursNote",
  "hoursExceptions",
  "social",
  "cover",
  "photos",
  "pricingMode",
  "services",
  "accessibility",
] as const satisfies readonly AnchorKey[];

const PUBLIC_CODES: ReadonlySet<string> = new Set(
  LISTING_EDIT_PUBLIC_MISSING_CODES,
);

/** DOM anchor id back to its ANCHOR key. */
const ANCHOR_KEY_BY_ID: ReadonlyMap<string, AnchorKey> = new Map(
  (Object.keys(ANCHOR) as AnchorKey[]).map((anchorKey) => [
    ANCHOR[anchorKey],
    anchorKey,
  ]),
);

/**
 * The still-missing fields a listing edit draft tells staff about: each field's
 * ANCHOR key, kept only for public listing fields (consent, ownership and the
 * owner's personal fields stay out), once each, in page order.
 */
export function listingEditMissingCodes(missing: MissingField[]): string[] {
  const codes: string[] = [];
  for (const field of missing) {
    const anchorKey = ANCHOR_KEY_BY_ID.get(field.anchor);
    if (anchorKey === undefined || !PUBLIC_CODES.has(anchorKey)) continue;
    if (!codes.includes(anchorKey)) codes.push(anchorKey);
  }
  return codes;
}
