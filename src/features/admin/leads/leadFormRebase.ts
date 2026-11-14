import type { LeadDTO } from "./api/leads.types";
import {
  isLeadFormDirty,
  leadFormValuesOf,
  type LeadFormValues,
  type LeadLinkRow,
} from "./leadForm.model";

const textsOf = (rows: readonly LeadLinkRow[]): string[] =>
  rows.map((row) => row.text);

const hasSameTexts = (first: readonly string[], second: readonly string[]) =>
  first.length === second.length &&
  first.every((text, index) => text === second[index]);

/**
 * The form after the stored lead moved from `previousLead` to `nextLead`
 * (a colleague's save reaching us with any write, or our own). Each field
 * this viewer left as seeded takes the new stored value; each field they
 * changed keeps their text. A form that ends up matching the stored lead is
 * seeded from it whole, so it reads exactly as stored. Link rows whose
 * texts did not change keep their keys, so an input never remounts under
 * the caret.
 */
export function rebasedValuesOf(
  previousLead: LeadDTO,
  nextLead: LeadDTO,
  values: LeadFormValues,
): LeadFormValues {
  const seeded = leadFormValuesOf(previousLead);
  const stored = leadFormValuesOf(nextLead);
  const isLinksTouched = !hasSameTexts(
    textsOf(values.links),
    textsOf(seeded.links),
  );
  const rebased: LeadFormValues = {
    ...values,
    name: values.name === seeded.name ? stored.name : values.name,
    type: values.type === seeded.type ? stored.type : values.type,
    location:
      values.location === seeded.location ? stored.location : values.location,
    email: values.email === seeded.email ? stored.email : values.email,
    phone: values.phone === seeded.phone ? stored.phone : values.phone,
    links: isLinksTouched ? values.links : stored.links,
    followUpOn:
      values.followUpOn === seeded.followUpOn
        ? stored.followUpOn
        : values.followUpOn,
  };
  const settled = isLeadFormDirty(nextLead, rebased) ? rebased : stored;
  return hasSameTexts(textsOf(settled.links), textsOf(values.links))
    ? { ...settled, links: values.links }
    : settled;
}

/** True when focus sits on the page itself or inside `container`, a part
 *  that is folding away. Focus the viewer moved elsewhere is left alone. */
export function isFocusLostOrWithin(container: HTMLElement | null): boolean {
  const focused = document.activeElement;
  if (focused === null || focused === document.body) return true;
  return container?.contains(focused) === true;
}
