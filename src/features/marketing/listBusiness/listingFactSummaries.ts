import type { TFunction } from "../../../shared/i18n/types";
import { attributeLabel } from "./listingAttributes.data";
import {
  COVER_POLICY_CHOICE_LABEL_KEYS,
  coverPolicyLabel,
  entryModeLabel,
  inclusionPracticeLabel,
  languageLabel,
  nifInvoicesLabel,
  paymentsSummary,
} from "./listingFacts.data";
import {
  listingFactsForPayload,
  withOnlyOfferedFacts,
  type ListingFactsPayload,
  type ListingFactsSource,
} from "./listingFactsPayload";
import { listingKindOf } from "./listingMobile.data";

/** A summary source that may say whether it is an edit. */
export type ListingFactsSummarySource = ListingFactsSource & {
  managementRole?: string;
};

/** Whether the draft is for a listing that does not exist yet:
 *  `managementRole` is set on every edit (`dtoToDraft`) and absent on a
 *  create, the same signal `ownerBlock` and the 18+ rules read. */
export function isNewListingDraft(source: {
  managementRole?: string;
}): boolean {
  return source.managementRole === undefined;
}

/** The facts as the save will see them. A create first drops the
 *  attributes, highlights and practices outside the kind and categories'
 *  offer (`withOnlyOfferedFacts`, which `draftToDto` runs too); an
 *  edit keeps what the listing carries. */
export function factsSourceAsSaved<Source extends ListingFactsSummarySource>(
  source: Source,
): Source {
  return isNewListingDraft(source) ? withOnlyOfferedFacts(source) : source;
}

/** One printable line per fact, "" for anything unanswered. The review step,
 *  the full preview and the live preview all read these, so each prints
 *  exactly what a save would send, a create's offer filter included. */
export interface ListingFactSummaries {
  attributes: string;
  highlights: string;
  entry: string;
  cover: string;
  payments: string;
  nif: string;
  practices: string;
  languages: string;
}

/** The one separator for a list value ("Card · MB WAY"), the same the public
 *  page joins its lists with. */
const LIST_SEPARATOR = " · ";

/** "Free before 23:00", or "Free before a set time" while the time is
 *  missing or not a valid `HH:MM`, so the line never ends in a blank. */
function coverSummary(
  t: TFunction,
  coverPolicy: ListingFactsPayload["coverPolicy"],
  coverFreeBefore: string | null,
): string {
  if (!coverPolicy) return "";
  if (coverPolicy === "freeBefore" && !coverFreeBefore) {
    return t(COVER_POLICY_CHOICE_LABEL_KEYS.freeBefore);
  }
  return coverPolicyLabel(t, coverPolicy, coverFreeBefore ?? "");
}

export function listingFactSummaries(
  t: TFunction,
  source: ListingFactsSummarySource,
): ListingFactSummaries {
  const facts = listingFactsForPayload(factsSourceAsSaved(source));
  const kind = listingKindOf(source);
  return {
    attributes: facts.attributes
      .map((slug) => attributeLabel(t, slug))
      .join(LIST_SEPARATOR),
    highlights: facts.highlights
      .map((slug) => attributeLabel(t, slug))
      .join(LIST_SEPARATOR),
    entry: facts.entryMode ? entryModeLabel(t, facts.entryMode, kind) : "",
    cover: coverSummary(t, facts.coverPolicy, facts.coverFreeBefore),
    payments: paymentsSummary(t, facts.payments),
    nif: nifInvoicesLabel(t, facts.issuesNifInvoices),
    practices: facts.inclusionPractices
      .map((practice) => inclusionPracticeLabel(t, practice))
      .join(LIST_SEPARATOR),
    languages: [
      ...facts.langs.map((code) => languageLabel(t, code)),
      ...(facts.langsOther ? [facts.langsOther] : []),
    ].join(LIST_SEPARATOR),
  };
}
