import { listingKindOf } from "../../listingMobile.data";
import { attributeLabel } from "../../listingAttributes.data";
import {
  coverPolicyLabel,
  entryModeLabel,
  inclusionPracticeLabel,
  nifInvoicesLabel,
  normalizePaymentMethods,
  PAYMENT_METHOD_LABEL_KEYS,
} from "../../listingFacts.data";
import { listingFactsForPayload } from "../../listingFactsPayload";
import type { ListingDraft } from "../../listBusiness.data";
import type { RestoreFieldChange } from "./restoreDiff.types";
import {
  choiceField,
  DIFF_KEY_PREFIX,
  setField,
  type RestoreDiffContext,
} from "./restoreDiffFields.data";

/**
 * How the review shows the attribute and fact fields. Single answers read as
 * a sentence would print them (the payload's cleaned value, so an answer the
 * listing's kind or categories no longer keep reads as unanswered); lists
 * read as what bringing the copy back would add and remove.
 */

type FieldBuilder = (context: RestoreDiffContext) => RestoreFieldChange[];

export type FactFieldKey =
  | "attributes"
  | "highlights"
  | "entryMode"
  | "coverPolicy"
  | "coverFreeBefore"
  | "payments"
  | "issuesNifInvoices"
  | "inclusionPractices"
  | "saferSpacePolicyUrl"
  | "langsOther";

const factsOf = (draft: ListingDraft) => listingFactsForPayload(draft);

/** The in-person ways to pay get a label of their own; the online
 *  listing's payments row keeps `field.payments`. */
const IN_PERSON_PAYMENTS_LABEL_KEY = `${DIFF_KEY_PREFIX}.field.paymentsInPerson`;

export const FACT_FIELD_BUILDERS: Record<FactFieldKey, FieldBuilder> = {
  attributes: (context) =>
    setField(context, "attributes", (slug) => attributeLabel(context.t, slug)),
  highlights: (context) =>
    setField(context, "highlights", (slug) => attributeLabel(context.t, slug)),
  entryMode: (context) =>
    choiceField(context, "entryMode", (draft) => {
      const mode = factsOf(draft).entryMode;
      return mode ? entryModeLabel(context.t, mode, listingKindOf(draft)) : "";
    }),
  coverPolicy: (context) =>
    choiceField(context, "coverPolicy", (draft) => {
      const facts = factsOf(draft);
      return facts.coverPolicy
        ? coverPolicyLabel(
            context.t,
            facts.coverPolicy,
            facts.coverFreeBefore ?? "",
          )
        : "";
    }),
  coverFreeBefore: (context) =>
    choiceField(
      context,
      "coverFreeBefore",
      (draft) => factsOf(draft).coverFreeBefore ?? "",
    ),
  payments: (context) =>
    setField(context, "payments", (method) => {
      const known = normalizePaymentMethods([method])[0];
      return known ? context.t(PAYMENT_METHOD_LABEL_KEYS[known]) : method;
    }).map((change) => ({
      ...change,
      labelKey: IN_PERSON_PAYMENTS_LABEL_KEY,
    })),
  issuesNifInvoices: (context) =>
    choiceField(context, "issuesNifInvoices", (draft) =>
      nifInvoicesLabel(context.t, factsOf(draft).issuesNifInvoices),
    ),
  inclusionPractices: (context) =>
    setField(context, "inclusionPractices", (practice) =>
      inclusionPracticeLabel(context.t, practice),
    ),
  saferSpacePolicyUrl: (context) =>
    choiceField(
      context,
      "saferSpacePolicyUrl",
      (draft) => factsOf(draft).saferSpacePolicyUrl ?? "",
    ),
  langsOther: (context) =>
    choiceField(context, "langsOther", (draft) => factsOf(draft).langsOther),
};
