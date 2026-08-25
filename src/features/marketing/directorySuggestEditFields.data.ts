import type { SuggestEditField } from "./api/useSuggestEdit";

/**
 * What a member can actually offer as a replacement value, per field bucket.
 *
 * The bounds mirror the real listing columns the accept path writes to
 * (`accepted-suggestion-value.ts` on the backend): address 300, phone 60,
 * website 300, hours lands on the hours note at 300, description lands on the
 * tagline at 200. Matching them here means the input stops the member at the
 * same place the server would, instead of letting them type a value that is
 * refused on submit.
 *
 * `other` is the catch-all for corrections that map to no single column, so
 * there is nothing a typed value could be written to. The server returns 400
 * for a proposed value on `other`, so the input is not offered for it at all.
 */
export interface SuggestEditFieldShape {
  /** Native input type, so a phone gets a phone keypad and a URL gets a URL one. */
  inputType: "text" | "tel" | "url";
  /** Server ceiling for the column this bucket writes to. */
  maxLength: number;
  /** Multi-line, for the buckets whose target column holds a sentence. */
  isMultiline: boolean;
  labelKey: string;
  placeholderKey: string;
}

/** Buckets that accept a proposed value, keyed by field. A bucket missing from
 *  this map takes prose only. */
export const SUGGEST_EDIT_VALUE_SHAPES: Partial<
  Record<SuggestEditField, SuggestEditFieldShape>
> = {
  hours: {
    inputType: "text",
    maxLength: 300,
    isMultiline: true,
    labelKey: "marketing:directory.detail.suggestEdit.value.hours.label",
    placeholderKey:
      "marketing:directory.detail.suggestEdit.value.hours.placeholder",
  },
  address: {
    inputType: "text",
    maxLength: 300,
    isMultiline: false,
    labelKey: "marketing:directory.detail.suggestEdit.value.address.label",
    placeholderKey:
      "marketing:directory.detail.suggestEdit.value.address.placeholder",
  },
  phone: {
    inputType: "tel",
    maxLength: 60,
    isMultiline: false,
    labelKey: "marketing:directory.detail.suggestEdit.value.phone.label",
    placeholderKey:
      "marketing:directory.detail.suggestEdit.value.phone.placeholder",
  },
  website: {
    inputType: "url",
    maxLength: 300,
    isMultiline: false,
    labelKey: "marketing:directory.detail.suggestEdit.value.website.label",
    placeholderKey:
      "marketing:directory.detail.suggestEdit.value.website.placeholder",
  },
  description: {
    inputType: "text",
    maxLength: 200,
    isMultiline: true,
    labelKey: "marketing:directory.detail.suggestEdit.value.description.label",
    placeholderKey:
      "marketing:directory.detail.suggestEdit.value.description.placeholder",
  },
};

/** The shape of a proposed value for this bucket, or null when the bucket takes
 *  prose only. */
export function suggestEditValueShape(
  field: SuggestEditField,
): SuggestEditFieldShape | null {
  return SUGGEST_EDIT_VALUE_SHAPES[field] ?? null;
}
