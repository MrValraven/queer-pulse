import type { TFunction } from "../../shared/i18n/types";
import { websiteHref, type DirectoryPlace } from "./directoryPlaces";
import {
  groupAttributesForDisplay,
  type DisplayAttributeGroup,
  type ListingAttributeVocabulary,
} from "./listBusiness/listingAttributes.data";
import {
  coverPolicyLabel,
  entryModeLabel,
  languageLabel,
  nifInvoicesLabel,
  normalizeCoverPolicy,
  normalizeEntryMode,
  normalizeLanguageCodes,
  normalizePaymentMethods,
  PAYMENT_METHOD_LABEL_KEYS,
  paymentsSummary,
  type ListingPaymentMethod,
} from "./listBusiness/listingFacts.data";
import { listingKindOf } from "./listBusiness/listingMobile.data";

export interface GettingInRow {
  key: "entry" | "cover" | "payments" | "nif" | "languages";
  labelKey: string;
  value: string;
}

const LABEL = "marketing:directory.detail.gettingIn";

/** The one separator for a list value ("Card · MB WAY"), the same the
 *  Ordering & delivery block joins its ways to pay with. */
const LIST_SEPARATOR = " · ";

/** The ways to pay in person as one line; cash alone reads "Cash only". */
function paymentsLine(
  t: TFunction,
  payments: readonly ListingPaymentMethod[],
): string {
  if (payments.length === 1 && payments[0] === "cash") {
    return paymentsSummary(t, payments);
  }
  return payments
    .map((method) => t(PAYMENT_METHOD_LABEL_KEYS[method]))
    .join(LIST_SEPARATOR);
}

/** The "Before you go" rows a listing answered, in reading order. An online
 *  listing has no way in and keeps its ways to pay in "Ordering & delivery",
 *  so it answers the NIF question and its languages alone. */
export function gettingInRows(
  t: TFunction,
  place: DirectoryPlace,
): GettingInRow[] {
  const kind = listingKindOf(place);
  const isOnline = kind === "online";
  const rows: GettingInRow[] = [];
  const entryMode = isOnline ? null : normalizeEntryMode(place.entryMode);
  if (entryMode) {
    rows.push({
      key: "entry",
      labelKey: `${LABEL}.entry`,
      value: entryModeLabel(t, entryMode, kind),
    });
  }
  const coverPolicy = isOnline ? null : normalizeCoverPolicy(place.coverPolicy);
  if (coverPolicy) {
    rows.push({
      key: "cover",
      labelKey: `${LABEL}.cover`,
      value: coverPolicyLabel(t, coverPolicy, place.coverFreeBefore ?? ""),
    });
  }
  const payments = isOnline ? [] : normalizePaymentMethods(place.payments);
  if (payments.length > 0) {
    rows.push({
      key: "payments",
      labelKey: `${LABEL}.payments`,
      value: paymentsLine(t, payments),
    });
  }
  const nif = nifInvoicesLabel(t, place.issuesNifInvoices);
  if (nif) rows.push({ key: "nif", labelKey: `${LABEL}.nif`, value: nif });
  const otherLanguages = (place.langsOther ?? "").trim();
  const languages = [
    ...normalizeLanguageCodes(place.langs).map((code) =>
      languageLabel(t, code),
    ),
    ...(otherLanguages ? [otherLanguages] : []),
  ];
  if (languages.length > 0) {
    rows.push({
      key: "languages",
      labelKey: `${LABEL}.languages`,
      value: languages.join(LIST_SEPARATOR),
    });
  }
  return rows;
}

/** "What's here" for this listing: its attributes grouped for its kind and
 *  its own categories, so a slug two groups share (alcohol-free drinks in
 *  "Food & drink" and "Nights out") sits under the heading the owner ticked
 *  it in, the same as in the owner picker. */
export function whatsHereGroups(
  place: DirectoryPlace,
  vocabulary?: ListingAttributeVocabulary,
): DisplayAttributeGroup[] {
  const categories =
    place.cats && place.cats.length > 0 ? place.cats : [place.cat];
  return groupAttributesForDisplay(
    place.attributes ?? [],
    listingKindOf(place),
    vocabulary,
    categories,
  );
}

/** The server stores the policy with `https://`; a demo draft may not. */
export function policyHref(url: string): string {
  return websiteHref(url);
}
