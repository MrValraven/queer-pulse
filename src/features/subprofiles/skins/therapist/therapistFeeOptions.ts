/** Fixed choices for the therapist fee small print. The editor offers them as
 *  chips (payment allows several), the public page shows their labels in the
 *  reader's language. A stored value that is not a known choice is older
 *  owner-typed text and renders exactly as typed. */

import type { TFunction } from "../../../../shared/i18n/types";

export const FREQUENCY_VALUES = [
  "weekly",
  "fortnightly",
  "weeklyOrFortnightly",
  "monthly",
  "flexible",
] as const;

export const PAYMENT_METHOD_VALUES = [
  "mbway",
  "transfer",
  "multibanco",
  "card",
  "cash",
  "paypal",
  "wise",
  "revolut",
] as const;

export const RECEIPT_TIME_VALUES = [
  "atSession",
  "sameDay",
  "within48h",
  "endOfMonth",
  "onRequest",
] as const;

export const CANCELLATION_NOTICE_VALUES = [
  "24h",
  "48h",
  "72h",
  "none",
] as const;

/** The `therapyFees` fields whose values come from the lists above. */
export type FeeChoiceField =
  "frequency" | "paymentMethods" | "receiptTime" | "cancellationNotice";

export const FEE_CHOICE_VALUES: Record<FeeChoiceField, readonly string[]> = {
  frequency: FREQUENCY_VALUES,
  paymentMethods: PAYMENT_METHOD_VALUES,
  receiptTime: RECEIPT_TIME_VALUES,
  cancellationNotice: CANCELLATION_NOTICE_VALUES,
};

/** The choice's label key, shared by the editor and the public page:
 *  `subprofiles:skinBlock.therapist.therapyFees.<field>_<value>`. */
export function feeChoiceLabelKey(
  field: FeeChoiceField,
  value: string,
): string {
  return `subprofiles:skinBlock.therapist.therapyFees.${field}_${value}`;
}

/** A payment method's label for use inside a list, lower-case except brand
 *  names ("MB WAY, bank transfer or card"):
 *  `subprofiles:skinBlock.therapist.therapyFees.paymentMethodsInList_<value>`. */
export function feeChoiceInListKey(value: string): string {
  return `subprofiles:skinBlock.therapist.therapyFees.paymentMethodsInList_${value}`;
}

/** The known value a stored text stands for, or null for older free text.
 *  Matches the value itself or its label in the current language, ignoring
 *  case and surrounding spaces, so a typed "Weekly" counts as "weekly". */
export function matchFeeChoice(
  t: TFunction,
  field: FeeChoiceField,
  value: string,
): string | null {
  const folded = value.trim().toLowerCase();
  if (!folded) return null;
  return (
    FEE_CHOICE_VALUES[field].find(
      (choice) =>
        choice.toLowerCase() === folded ||
        t(feeChoiceLabelKey(field, choice)).toLowerCase() === folded,
    ) ?? null
  );
}

/** The label for a stored value: the translated choice when it matches one
 *  of the field's values, otherwise the stored text itself (trimmed). */
export function resolveFeeChoice(
  t: TFunction,
  field: FeeChoiceField,
  value: string,
): string {
  const choice = matchFeeChoice(t, field, value);
  return choice ? t(feeChoiceLabelKey(field, choice)) : value.trim();
}
